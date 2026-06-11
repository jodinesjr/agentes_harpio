/* ════════════════════════════════════════════════════════════
   HARPIÖ v3 · interações, cenas de produto e gamificação
═════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const page = document.body.dataset.page || "";

  /* ───────── helpers ───────── */
  function makeTimers() {
    const list = [];
    return {
      later(fn, ms) { list.push(setTimeout(fn, ms)); },
      clear() { list.forEach(clearTimeout); list.length = 0; },
    };
  }
  function typeInto(el, text, t, speed, done) {
    let i = 0;
    const step = () => {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) t.later(step, speed + Math.random() * speed);
      else if (done) done();
    };
    step();
  }
  function onVisible(el, fn, threshold) {
    if (!el) return;
    new IntersectionObserver((es, io) => {
      if (es[0].isIntersecting) { fn(); io.disconnect(); }
    }, { threshold: threshold ?? 0.3 }).observe(el);
  }
  const fmtBR = new Intl.NumberFormat("pt-BR");

  /* ───────── básicos: header, menu, reveal ───────── */
  const header = $("#header");
  if (header) {
    const sc = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", sc, { passive: true }); sc();
  }
  const burger = $("#burger"), nav = $("#nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: "0px 0px -36px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("is-in"));

  /* ───────── gamificação: barra de progresso ───────── */
  const pbar = $("#pbar");
  if (pbar) {
    const upd = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      pbar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true }); upd();
  }

  /* ───────── gamificação: trilha lateral (home) ───────── */
  const rail = $("#rail");
  if (rail) {
    const links = $$("a[data-sec]", rail);
    const score = $(".rail__score", rail);
    const secs = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id));
          if (score) {
            const i = secs.indexOf(e.target);
            score.textContent = Math.round(((i + 1) / secs.length) * 100) + "%";
          }
        }
      });
    }, { rootMargin: "-40% 0px -52% 0px" });
    secs.forEach((s) => spy.observe(s));
  }

  /* ───────── gamificação: conquistas ───────── */
  const ACH_KEY = "harpio_achievements";
  const getAch = () => { try { return JSON.parse(localStorage.getItem(ACH_KEY)) || []; } catch { return []; } };
  let toastBusy = false;
  function achieve(id, title, sub) {
    const got = getAch();
    if (got.includes(id) || toastBusy) return;
    got.push(id);
    try { localStorage.setItem(ACH_KEY, JSON.stringify(got)); } catch {}
    const toast = $("#toast");
    if (!toast) return;
    toastBusy = true;
    $(".toast__title", toast).textContent = title;
    $(".toast__sub", toast).textContent = sub;
    toast.classList.add("is-on");
    setTimeout(() => { toast.classList.remove("is-on"); toastBusy = false; }, 4200);
  }
  $$("[data-achieve]").forEach((el) => {
    onVisible(el, () => {
      const [id, title, sub] = el.dataset.achieve.split("|");
      achieve(id, title, sub);
    }, 0.4);
  });

  /* ───────── gamificação: coleção do time ───────── */
  const TEAM_KEY = "harpio_team";
  const AGENTS = ["sofia", "rafael", "luna", "iris", "vera"];
  const getTeam = () => { try { return JSON.parse(localStorage.getItem(TEAM_KEY)) || []; } catch { return []; } };
  const agent = document.body.dataset.agent;
  if (agent && AGENTS.includes(agent)) {
    const t = getTeam();
    if (!t.includes(agent)) {
      t.push(agent);
      try { localStorage.setItem(TEAM_KEY, JSON.stringify(t)); } catch {}
    }
    if (t.length === 5) achieve("team5", "Time completo!", "Você conheceu os 5 super agentes de R&S.");
  }
  function paintTeam() {
    const met = getTeam();
    $$("[data-member]").forEach((card) => card.classList.toggle("is-met", met.includes(card.dataset.member)));
    $$("[data-teamcount]").forEach((el) => { el.textContent = met.length; });
    $$(".teambar__fill").forEach((f) => { f.style.width = (met.length / 5) * 100 + "%"; });
  }
  paintTeam();

  /* ───────── contadores numéricos ───────── */
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = el.dataset.dec ? parseInt(el.dataset.dec, 10) : 0;
    const suffix = el.dataset.suffix || "";
    onVisible(el, () => {
      if (reduced) { el.textContent = fmtBR.format(target) + suffix; return; }
      const dur = 1800, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const v = target * (1 - Math.pow(1 - p, 4));
        el.textContent = fmtBR.format(dec ? +v.toFixed(dec) : Math.round(v)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 0.5);
  });

  /* ───────── FAQ exclusivo ───────── */
  $$(".faq__item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) $$(".faq__item[open]").forEach((o) => { if (o !== item) o.open = false; });
    });
  });

  /* ───────── escada gamificada (níveis destravando) ───────── */
  const levels = $$(".level");
  if (levels.length) {
    onVisible(levels[0].parentElement, () => {
      levels.forEach((lv, i) => {
        setTimeout(() => {
          lv.classList.remove("is-locked");
          lv.classList.add("is-open");
        }, reduced ? 0 : 600 * i + 300);
      });
    }, 0.25);
  }

  /* ───────── cursor engine (cenas de produto) ───────── */
  function cursorTo(cur, target, container, dx, dy) {
    if (!cur || !target) return;
    const c = container.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const x = r.left - c.left + (dx ?? r.width * 0.6);
    const y = r.top - c.top + (dy ?? r.height * 0.55);
    cur.style.transform = `translate(${x}px, ${y}px)`;
  }
  function logCall(consoleEl, html, max) {
    if (!consoleEl) return;
    const p = document.createElement("p");
    p.innerHTML = html;
    consoleEl.appendChild(p);
    while (consoleEl.querySelectorAll("p").length > (max || 5)) consoleEl.querySelector("p").remove();
  }
  function addFeed(feedEl, who, html) {
    if (!feedEl) return;
    const d = document.createElement("div");
    d.className = "feed__item";
    d.innerHTML = `<span class="feed__ava"><svg><use href="${SPRITE}#ps-${who}"/></svg></span><p>${html}<br/><time>agora</time></p>`;
    feedEl.prepend(d);
    while (feedEl.children.length > 4) feedEl.lastElementChild.remove();
  }
  const SPRITE = document.body.dataset.sprite || "assets/img/personas.svg";

  /* ───────── HOME: cena do hero (agentes operando o Flow) ───────── */
  const stage = $("#flow-stage");
  if (stage) {
    const t = makeTimers();
    const curSofia = $("#cur-sofia"), curVera = $("#cur-vera"), curLuna = $("#cur-luna");
    const card = $("#kcard-mover"), score = $("#kscore-mover");
    const colTriagem = $("#kcol-triagem .kanban-drop"), colEntrevista = $("#kcol-entrevista .kanban-drop");
    const ghost = $("#kghost");
    const feed = $("#flow-feed"), cons = $("#flow-console");
    const toastW = $("#flow-toast");
    const kpiTTH = $("#kpi-tth");
    const counts = { triagem: $("#count-triagem"), entrevista: $("#count-entrevista") };

    function staticFinal() {
      score.classList.add("is-on");
      addFeed(feed, "sofia", "<b>Sofia</b> triou 240 currículos e sugeriu o top 20");
      addFeed(feed, "vera", "<b>Vera</b> enviou convite de entrevista para M. Tavares");
      logCall(cons, "<b>sofia.score_resume</b>(cv_0184) <i>→ 92 ✓</i>");
      logCall(cons, "<b>vera.send_email</b>(convite_entrevista) <i>→ aprovado ✓</i>");
    }

    function scene() {
      t.clear();
      // reset
      score.classList.remove("is-on");
      card.classList.remove("is-lift");
      card.style.transform = "";
      toastW.classList.remove("is-on");
      if (card.parentElement !== colTriagem) colTriagem.prepend(card);
      ghost.style.display = "none";
      [curSofia, curVera, curLuna].forEach((c) => c && c.classList.remove("is-on"));

      // 1 · Sofia chega e pontua o candidato
      t.later(() => {
        curSofia.classList.add("is-on");
        cursorTo(curSofia, card, stage);
      }, 500);
      t.later(() => {
        score.classList.add("is-on");
        logCall(cons, "<b>sofia.score_resume</b>(cv_0184) <i>→ 92 ✓</i>");
        addFeed(feed, "sofia", "<b>Sofia</b> avaliou <b>M. Tavares</b> — 92/100, evidência por critério");
      }, 1700);

      // 2 · Sofia move o card para Entrevista
      t.later(() => {
        card.classList.add("is-lift");
        const a = card.getBoundingClientRect();
        ghost.style.display = "block";
        colEntrevista.prepend(ghost);
        const b = ghost.getBoundingClientRect();
        card.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px)`;
        cursorTo(curSofia, colEntrevista, stage, 60, 60);
        logCall(cons, "<b>sofia.move_stage</b>(triagem → entrevista)");
      }, 2600);
      t.later(() => {
        ghost.style.display = "none";
        card.style.transform = "";
        card.classList.remove("is-lift");
        colEntrevista.prepend(card);
        if (counts.triagem) counts.triagem.textContent = "239";
        if (counts.entrevista) counts.entrevista.textContent = "13";
      }, 3800);

      // 3 · Vera agenda e comunica
      t.later(() => {
        curVera.classList.add("is-on");
        cursorTo(curVera, card, stage, 30, 20);
      }, 4200);
      t.later(() => {
        logCall(cons, "<b>vera.find_slot</b>(gestor, candidato) <i>→ qui 14h</i>");
        addFeed(feed, "vera", "<b>Vera</b> agendou entrevista — qui 14h, convite enviado");
      }, 5300);
      t.later(() => {
        logCall(cons, "<b>vera.send_email</b>(convite) <i>→ aguardando aprovação</i>");
      }, 6100);

      // 4 · Luna detecta risco
      t.later(() => {
        curLuna.classList.add("is-on");
        cursorTo(curLuna, toastW.parentElement, stage, stage.clientWidth * 0.55, stage.clientHeight * 0.8);
        toastW.classList.add("is-on");
        logCall(cons, "<b>luna.sla_watch</b>(vaga_sinistros) <i>→ sinal 87</i>");
      }, 6900);
      t.later(() => toastW.classList.remove("is-on"), 9300);

      // 5 · Iris atualiza KPI
      t.later(() => {
        if (kpiTTH) kpiTTH.textContent = "11,8d";
        addFeed(feed, "iris", "<b>Iris</b> atualizou o painel — time-to-hire 11,8 dias (−67%)");
        logCall(cons, "<b>iris.build_dashboard</b>(semana_24) <i>→ ok</i>");
      }, 9800);

      // loop
      t.later(scene, 12600);
    }

    onVisible(stage, () => {
      achieve("flow", "Você viu o Flow ao vivo", "Agentes operando uma vaga real, em tempo real.");
      if (reduced) staticFinal(); else scene();
    }, 0.35);
  }

  /* ───────── HOME: widgets vivos ───────── */
  // funil
  const funnel = $("#w-funnel");
  if (funnel) onVisible(funnel, () => {
    $$(".funnel__bar i", funnel).forEach((b) => { b.style.width = b.dataset.w; });
  });
  // agenda
  const cal = $("#w-cal");
  if (cal) onVisible(cal, () => {
    const slots = $$("i", cal);
    const seq = [3, 7, 11, 8, 14];
    seq.forEach((idx, k) => setTimeout(() => {
      if (slots[idx]) slots[idx].classList.add(k % 2 ? "is-busy" : "is-set");
    }, reduced ? 0 : 500 * (k + 1)));
  });
  // inbox
  const inbox = $("#w-inbox");
  if (inbox) onVisible(inbox, () => {
    const msgs = [
      `<div class="inbox__msg"><i></i><div><b>Vera → João P.</b><br/><span>“Seu teste técnico chegou! Prazo: 48h. Qualquer dúvida, me chama.”</span></div></div>`,
      `<div class="inbox__msg reply"><i></i><div><b>João P.</b><br/><span>“Recebido! Obrigado pelo retorno rápido 🙌”</span></div></div>`,
      `<div class="inbox__msg"><i></i><div><b>Vera → Marina S.</b><br/><span>Devolutiva estruturada em 3 blocos — revisada pelo crítico de empatia.</span></div></div>`,
    ];
    msgs.forEach((m, k) => setTimeout(() => inbox.insertAdjacentHTML("beforeend", m), reduced ? 0 : 900 * (k + 1)));
  });
  // NPS gauge
  const gauge = $("#w-gauge .gauge__val");
  if (gauge) onVisible(gauge, () => { gauge.style.strokeDashoffset = "34"; });
  // alertas Luna
  const alerts = $("#w-alerts");
  if (alerts) onVisible(alerts, () => {
    const list = [
      `<div class="alert"><b>Candidato parado</b><span>9d no teste técnico</span><span class="mono">sinal 74</span></div>`,
      `<div class="alert alert--hi"><b>Shortlist sem revisão</b><span>gestor há 5 dias</span><span class="mono">sinal 88</span></div>`,
      `<div class="alert alert--ok"><b>Talento de volta</b><span>Diego C. open to work</span><span class="mono">match ✓</span></div>`,
    ];
    list.forEach((a, k) => setTimeout(() => alerts.insertAdjacentHTML("beforeend", a), reduced ? 0 : 1000 * (k + 1)));
  });
  // sparkline
  const spark = $("#w-spark");
  if (spark) onVisible(spark, () => spark.classList.add("is-in"));

  /* ───────── PÁGINAS DE AGENTE: demos ───────── */
  // Sofia — triagem em lote
  const dSofia = $("#demo-sofia");
  if (dSofia) onVisible(dSofia, () => {
    const t = makeTimers();
    const rows = [
      { n: "M. Tavares", r: "Analista de Sinistros Sr", s: 92 },
      { n: "J. Okamoto", r: "Regulação de Sinistros Pl", s: 88 },
      { n: "R. Ferraz", r: "Analista de Crédito Pl", s: 85, flag: "gap 2023 — contexto solicitado via Vera" },
      { n: "C. Almeida", r: "Atendimento · Seguros", s: 81 },
      { n: "P. Duarte", r: "Cobrança Jr", s: 74 },
    ];
    const list = $(".screen__list", dSofia);
    const prog = $("#sofia-prog");
    const cons = $("#sofia-console");
    list.innerHTML = "";
    rows.forEach((r, i) => {
      t.later(() => {
        const el = document.createElement("div");
        el.className = "trow";
        el.innerHTML = `<div class="trow__who"><b>${r.n}</b><span>${r.r}</span></div>
          <div class="trow__bar"><i></i></div><div class="trow__score" data-s="${r.s}">0</div>
          ${r.flag ? `<span class="trow__flag">⚠ ${r.flag}</span>` : ""}`;
        list.appendChild(el);
        const bar = $("i", el), sc = $(".trow__score", el);
        requestAnimationFrame(() => { bar.style.width = r.s + "%"; });
        let v = 0;
        const iv = setInterval(() => { v += 4; if (v >= r.s) { v = r.s; clearInterval(iv); } sc.textContent = v; }, 28);
        if (prog) prog.innerHTML = `<b>${Math.round(((i + 1) / rows.length) * 240)}</b> de 240 analisados`;
        logCall(cons, `<b>score_resume</b>(cv_${String(184 + i)}) <i>→ ${r.s} ✓</i>`, 4);
      }, reduced ? 0 : 900 * i + 400);
    });
  }, 0.3);

  // Rafael — boolean + resultados
  const dRafael = $("#demo-rafael");
  if (dRafael) onVisible(dRafael, () => {
    const t = makeTimers();
    const q = $("#rafael-query");
    const QUERY = `("analista de sinistros" OR "regulação de sinistros") AND (SUSEP OR "ramos elementares") AND ("disponível" OR "open to work") NOT estagiário`;
    typeInto(q, QUERY, t, 14, () => {
      const res = $("#rafael-results");
      const cards = [
        { i: "DC", n: "Diego C.", r: "Sinistros Auto · 6 anos", m: "94%" },
        { i: "LS", n: "Larissa S.", r: "Regulação RE · SUSEP ✓", m: "91%" },
        { i: "FB", n: "Felipe B.", r: "Sinistros Vida · 4 anos", m: "87%" },
        { i: "AM", n: "Ana M.", r: "Atendimento Sinistros", m: "84%" },
      ];
      cards.forEach((c, k) => t.later(() => {
        res.insertAdjacentHTML("beforeend",
          `<div class="rcard"><i>${c.i}</i><div><b>${c.n}</b><span>${c.r}</span></div><em>${c.m}</em></div>`);
      }, 600 * (k + 1)));
      t.later(() => { const ch = $("#rafael-channels"); if (ch) ch.style.opacity = "1"; }, 3000);
    });
  }, 0.3);

  // Iris — gráfico + briefing
  const dIris = $("#demo-iris");
  if (dIris) onVisible(dIris, () => {
    $(".chart", dIris).classList.add("is-in");
    const t = makeTimers();
    const brief = $("#iris-brief");
    const TXT = "Time-to-hire caiu 41% no trimestre. O gargalo mudou: shortlists aguardam revisão do gestor por 3,2 dias em média. Recomendo SLA de revisão em 48h — impacto estimado: −2,4 dias no ciclo.";
    t.later(() => typeInto(brief, TXT, t, 12), reduced ? 0 : 1400);
  }, 0.3);

  // Vera — composer com crítico de empatia
  const dVera = $("#demo-vera");
  if (dVera) onVisible(dVera, () => {
    const t = makeTimers();
    const body = $("#vera-body");
    const MSG = "Olá, Marina — obrigada por chegar até a etapa final. A decisão foi difícil. O que pesou: buscávamos mais profundidade em regulação de sinistros complexos. Seus pontos fortes em atendimento e organização foram destaque unânime. Adoraríamos te considerar para a vaga de Analista de Atendimento que abre em julho. Posso te inscrever?";
    typeInto(body, MSG, t, 11, () => {
      $$("#vera-critic span").forEach((s, k) => t.later(() => s.classList.add("is-ok"), 500 * (k + 1)));
      t.later(() => {
        const st = $("#vera-status");
        st.textContent = "✓ aprovada por você · enviada";
        st.classList.add("is-sent");
      }, 2400);
    });
  }, 0.3);

  // Luna — feed de sinais
  const dLuna = $("#demo-luna");
  if (dLuna) onVisible(dLuna, () => {
    const t = makeTimers();
    const list = $("#luna-feed");
    const items = [
      `<div class="alert"><b>Vaga em risco de SLA</b><span>Sinistros · 78% do prazo</span><span class="mono">sinal 81 → notificar</span></div>`,
      `<div class="alert alert--ok"><b>Watchlist match</b><span>Diego C. mudou para open to work</span><span class="mono">reabrir contato?</span></div>`,
      `<div class="alert alert--hi"><b>Calibragem vencendo</b><span>gestor sem revisar há 5 dias</span><span class="mono">sinal 88 → escalar</span></div>`,
      `<div class="alert"><b>Candidato parado</b><span>9 dias no teste técnico</span><span class="mono">sinal 74 → lembrete</span></div>`,
    ];
    items.forEach((a, k) => t.later(() => {
      list.insertAdjacentHTML("afterbegin", a);
      while (list.children.length > 4) list.lastElementChild.remove();
    }, reduced ? 0 : 1300 * (k + 1)));
  }, 0.3);

  /* ───────── demos genéricas reutilizadas em outras páginas ───────── */
  $$("[data-typewrite]").forEach((el) => {
    onVisible(el, () => {
      const t = makeTimers();
      typeInto(el, el.dataset.typewrite, t, 13);
    }, 0.4);
  });
})();
