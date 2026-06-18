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

/* ════════════════════════════════════════════════════════════
   v4 · motor de vídeo + canvas sintético + scroll-scrub
═════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  /* ── nav v4: sticky + burger ── */
  var nav = $(".nav4");
  if(nav){
    var stick=function(){ nav.classList.toggle("is-stuck", window.scrollY>6); };
    window.addEventListener("scroll", stick, {passive:true}); stick();
    var b=$(".burger4"), links=$(".nav4__links");
    if(b&&links){ b.addEventListener("click",function(){ links.classList.toggle("is-open"); }); }
  }

  /* ── reveal up ── */
  var ups=$$(".up");
  if("IntersectionObserver"in window && !reduce){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target);} }); },{threshold:.12,rootMargin:"0px 0px -40px 0px"});
    ups.forEach(function(el){ io.observe(el); });
  } else ups.forEach(function(el){ el.classList.add("is-in"); });

  /* ── TDI bars on reveal ── */
  var tdi=$(".tdi__board");
  if(tdi){ var t=new IntersectionObserver(function(es,o){ if(es[0].isIntersecting){ $$(".bar i",tdi).forEach(function(i){ i.style.width=i.getAttribute("data-w"); }); o.disconnect(); } },{threshold:.4}); t.observe(tdi); }

  /* ── VÍDEO REAL: tenta carregar; senão ativa canvas ── */
  $$(".vlayer").forEach(function(v){
    var ok=false;
    v.addEventListener("loadeddata",function(){ ok=true; v.classList.add("is-ready"); var st=v.closest(".vstage"); if(st){ var c=st.querySelector(".vcanvas"); if(c) c.style.display="none"; } });
    v.addEventListener("error", fall); 
    // se em 1.2s não carregou (sem arquivo), mantém o canvas
    setTimeout(function(){ if(!ok) fall(); },1200);
    function fall(){ /* canvas permanece visível; vídeo fica oculto */ v.style.display="none"; }
    if(!reduce){ var p=v.play&&v.play(); if(p&&p.catch) p.catch(function(){}); }
  });

  /* ════════ CANVAS SINTÉTICO · GRAFO DE TALENTO VIVO ════════ */
  var heroCanvas=$("#talentgraph");
  if(heroCanvas && !reduce){
    var ctx=heroCanvas.getContext("2d"), W,H,DPR=Math.min(window.devicePixelRatio||1,2);
    var AG=[ {c:"#6e3aff"},{c:"#0e9f6e"},{c:"#2d9cdb"},{c:"#f2994a"},{c:"#eb4d8b"} ];
    var cand=[], agents=[], edges=[], scrollK=0, mx=0,my=0;
    function size(){ var r=heroCanvas.getBoundingClientRect(); W=r.width; H=r.height; heroCanvas.width=W*DPR; heroCanvas.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); build(); }
    function build(){
      cand=[]; var n=Math.min(72, Math.round(W*H/14000));
      for(var i=0;i<n;i++) cand.push({ x:Math.random()*W, y:Math.random()*H, r:1.2+Math.random()*1.8, vy:.12+Math.random()*.28, vx:(Math.random()-.5)*.16, m:0 });
      agents=AG.map(function(a,i){ return { x:W*(.18+.16*i), y:H*(.5+ (i%2?-.12:.12)), c:a.c, ph:Math.random()*6.28, t:Math.random()*200 }; });
      edges=[];
    }
    function loop(){
      ctx.clearRect(0,0,W,H);
      // candidatos sobem (funil) — drift
      var spd=1+scrollK*1.4;
      for(var i=0;i<cand.length;i++){ var p=cand[i]; p.y-=p.vy*spd; p.x+=p.vx + (mx*.006*(p.r)); if(p.y<-6){ p.y=H+6; p.x=Math.random()*W; p.m=0; }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283);
        if(p.m>0){ ctx.fillStyle="rgba(110,58,255,"+(.25+.5*p.m)+")"; ctx.shadowColor="rgba(110,58,255,.6)"; ctx.shadowBlur=8*p.m; } else { ctx.fillStyle="rgba(120,120,150,.28)"; ctx.shadowBlur=0; }
        ctx.fill(); p.m*=.985;
      }
      ctx.shadowBlur=0;
      // edges (matches) fade
      for(var e=edges.length-1;e>=0;e--){ var ed=edges[e]; ed.life-=.018; if(ed.life<=0){ edges.splice(e,1); continue; }
        ctx.strokeStyle="rgba("+ed.rgb+","+(ed.life*.5)+")"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ed.ax,ed.ay); ctx.lineTo(ed.bx,ed.by); ctx.stroke();
      }
      // agentes pulsam + escaneiam
      agents.forEach(function(a){ a.ph+=.02; a.t-=1; a.y+=Math.sin(a.ph)*.18;
        var pr=6+Math.sin(a.ph)*1.4;
        // halo
        var g=ctx.createRadialGradient(a.x,a.y,0,a.x,a.y,28); g.addColorStop(0, hexA(a.c,.22)); g.addColorStop(1, hexA(a.c,0));
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(a.x,a.y,28,0,6.283); ctx.fill();
        ctx.beginPath(); ctx.arc(a.x,a.y,pr,0,6.283); ctx.fillStyle=a.c; ctx.fill();
        if(a.t<=0){ a.t=120+Math.random()*120; // escaneia: liga ao candidato mais próximo
          var best=null,bd=1e9; for(var i=0;i<cand.length;i++){ var dx=cand[i].x-a.x,dy=cand[i].y-a.y,d=dx*dx+dy*dy; if(d<bd){bd=d;best=cand[i];} }
          if(best && bd<40000){ best.m=1; edges.push({ax:a.x,ay:a.y,bx:best.x,by:best.y,life:1,rgb:hexRGB(a.c)}); }
        }
      });
      requestAnimationFrame(loop);
    }
    function hexRGB(h){ var n=parseInt(h.slice(1),16); return (n>>16)+","+((n>>8)&255)+","+(n&255); }
    function hexA(h,a){ return "rgba("+hexRGB(h)+","+a+")"; }
    window.addEventListener("resize", size);
    window.addEventListener("scroll", function(){ var r=heroCanvas.getBoundingClientRect(); scrollK=Math.max(0,Math.min(1, -r.top/(r.height||1))); },{passive:true});
    heroCanvas.closest(".vstage").addEventListener("mousemove", function(ev){ var r=heroCanvas.getBoundingClientRect(); mx=(ev.clientX-r.left-W/2); my=(ev.clientY-r.top-H/2); });
    size(); loop();
  }

  /* ════════ HOW IT WORKS · scroll-scrub canvas + steps ════════ */
  var sec=$(".steps4");
  if(sec){
    var steps=$$(".step4",sec), zone=$(".steps4__scrollzone",sec), cv=$("#pipecanvas",sec);
    var realVid=$(".steps4 .vlayer[data-scrub]");
    function prog(){ if(!zone) return 0; var r=zone.getBoundingClientRect(); var vh=window.innerHeight; var total=r.height-vh; var p=(-r.top)/(total>0?total:1); return Math.max(0,Math.min(1,p)); }
    var pctx = cv? cv.getContext("2d"):null, PW,PH,PD=Math.min(window.devicePixelRatio||1,2);
    function psize(){ if(!cv) return; var r=cv.getBoundingClientRect(); PW=r.width;PH=r.height; cv.width=PW*PD; cv.height=PH*PD; pctx.setTransform(PD,0,0,PD,0,0); }
    function drawPipe(p){
      if(!pctx) return; pctx.clearRect(0,0,PW,PH);
      var cy=PH/2, x0=PW*.08, x1=PW*.92, gates=[x0+(x1-x0)*.18, x0+(x1-x0)*.5, x0+(x1-x0)*.82];
      // trilho
      pctx.strokeStyle="rgba(16,16,25,.10)"; pctx.lineWidth=3; pctx.beginPath(); pctx.moveTo(x0,cy); pctx.lineTo(x1,cy); pctx.stroke();
      // progresso
      var px=x0+(x1-x0)*p;
      var grad=pctx.createLinearGradient(x0,0,x1,0); grad.addColorStop(0,"#eb4d8b"); grad.addColorStop(.5,"#6e3aff"); grad.addColorStop(1,"#2d9cdb");
      pctx.strokeStyle=grad; pctx.lineWidth=4; pctx.beginPath(); pctx.moveTo(x0,cy); pctx.lineTo(px,cy); pctx.stroke();
      // gates
      gates.forEach(function(gx,i){ var on=px>=gx-2; pctx.beginPath(); pctx.arc(gx,cy,on?13:9,0,6.283); pctx.fillStyle=on?["#eb4d8b","#6e3aff","#2d9cdb"][i]:"#d7d7e2"; pctx.fill(); pctx.fillStyle="#fff"; pctx.font="700 11px Inter"; pctx.textAlign="center"; pctx.textBaseline="middle"; if(on) pctx.fillText((i+1),gx,cy); });
      // token candidato
      pctx.beginPath(); pctx.arc(px,cy,7,0,6.283); pctx.fillStyle="#0b0b13"; pctx.fill(); pctx.fillStyle="#fff"; pctx.beginPath(); pctx.arc(px,cy-1,2.4,0,6.283); pctx.fill();
    }
    function onScroll(){
      var p=prog();
      if(realVid && realVid.readyState>=2 && realVid.duration){ realVid.currentTime=p*realVid.duration; }
      drawPipe(p);
      var idx = p<.34?0 : p<.7?1:2;
      steps.forEach(function(s,i){ s.classList.toggle("is-on", i===idx); });
    }
    window.addEventListener("resize", psize);
    window.addEventListener("scroll", onScroll, {passive:true});
    psize(); if(steps[0]) steps[0].classList.add("is-on"); drawPipe(0); onScroll();
  }

  /* ── audience seg (Empresas/Hunters) marca ativo ── */
  var seg=$(".nav4__seg");
  if(seg){ var cur=document.body.getAttribute("data-aud"); $$("a",seg).forEach(function(a){ a.classList.toggle("is-on", a.getAttribute("data-aud")===cur); }); }
})();
