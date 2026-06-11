/* ════════════════════════════════════════════════════════════
   HARPIÖ MIND v2 · interações
═════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none)").matches;

  /* ───── header ───── */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ───── menu mobile ───── */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ───── reveal ───── */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ───── tabs de agentes + personas ───── */
  const tabs = [...document.querySelectorAll(".agtab")];
  const personasWrap = document.getElementById("personas");
  const personas = [...document.querySelectorAll(".persona")];
  let userPicked = false;

  function activate(agent) {
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.agent === agent));
    personas.forEach((p) => p.classList.toggle("is-active", p.dataset.agent === agent));
    if (personasWrap) personasWrap.classList.add("has-active");
  }
  tabs.forEach((t) =>
    t.addEventListener("click", () => { userPicked = true; activate(t.dataset.agent); })
  );
  personas.forEach((p) => {
    p.addEventListener("click", () => { userPicked = true; activate(p.dataset.agent); });
    p.addEventListener("focus", () => activate(p.dataset.agent));
  });

  // rotação automática até o usuário interagir
  if (!reduced && tabs.length) {
    const order = tabs.map((t) => t.dataset.agent);
    let i = 0;
    const spin = setInterval(() => {
      if (userPicked) { clearInterval(spin); return; }
      i = (i + 1) % order.length;
      activate(order[i]);
    }, 3200);
  }

  /* ───── tilt 3D nos cards de persona ───── */
  if (!reduced && !touch) {
    personas.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-10px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ───── contador grande ───── */
  const counter = document.getElementById("big-counter");
  if (counter) {
    const target = parseInt(counter.dataset.target, 10) || 0;
    const fmt = new Intl.NumberFormat("pt-BR");
    counter.textContent = fmt.format(0);
    const animate = () => {
      if (reduced) { counter.textContent = fmt.format(target); return; }
      const dur = 2400, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        counter.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    new IntersectionObserver((es, io) => {
      if (es[0].isIntersecting) { animate(); io.disconnect(); }
    }, { threshold: 0.5 }).observe(counter);
  }

  /* ───── stepper progressivo ───── */
  const steps = [...document.querySelectorAll(".step")];
  if (steps.length) {
    const list = document.getElementById("steps");
    new IntersectionObserver((es, io) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      steps.forEach((s, i) => setTimeout(() => s.classList.add("is-done"), reduced ? 0 : 450 * i + 300));
    }, { threshold: 0.35 }).observe(list);
  }

  /* ───── anatomia · scrollspy ───── */
  const pillars = [...document.querySelectorAll(".apillar")];
  const nodes = [...document.querySelectorAll(".anode")];
  if (pillars.length && nodes.length) {
    const setActive = (i) => {
      pillars.forEach((p) => p.classList.toggle("is-active", +p.dataset.i === i));
      nodes.forEach((n) => n.classList.toggle("is-active", +n.dataset.i === i));
    };
    setActive(0);
    const spy = new IntersectionObserver(
      (es) => {
        es.forEach((e) => { if (e.isIntersecting) setActive(+e.target.dataset.i); });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    pillars.forEach((p) => spy.observe(p));
  }

  /* ───── chat demo · Vera escreve devolutivas ───── */
  const typedEl = document.getElementById("typed-cmd");
  const replyEl = document.getElementById("agent-reply");
  const resultEl = document.getElementById("agent-result");
  const fillEl = document.getElementById("progress-fill");
  const labelEl = document.getElementById("progress-label");

  if (typedEl && replyEl && resultEl && fillEl && labelEl) {
    const CMD = "@Vera, devolutiva para os 18 reprovados da final — tom caloroso, feedback real.";
    const TOTAL = 18;
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const clearAll = () => { timers.forEach(clearTimeout); timers = []; };
    const label = (n) => `${n} de ${TOTAL} rascunhos`;

    function reset() {
      typedEl.textContent = "";
      replyEl.style.opacity = "0.25";
      resultEl.classList.remove("is-on");
      fillEl.style.width = "0%";
      labelEl.textContent = label(0);
    }
    function type(done) {
      let i = 0;
      const step = () => {
        typedEl.textContent = CMD.slice(0, i++);
        if (i <= CMD.length) timers.push(setTimeout(step, 24 + Math.random() * 30));
        else done();
      };
      step();
    }
    function progress(done) {
      replyEl.style.opacity = "1";
      replyEl.style.transition = "opacity .4s";
      [0.22, 0.45, 0.67, 0.85, 1].forEach((p, idx, arr) => {
        later(() => {
          fillEl.style.width = `${Math.round(p * 100)}%`;
          labelEl.textContent = label(Math.round(p * TOTAL));
          if (idx === arr.length - 1) later(done, 550);
        }, 540 * (idx + 1));
      });
    }
    function loop() {
      clearAll();
      reset();
      if (reduced) {
        typedEl.textContent = CMD;
        replyEl.style.opacity = "1";
        fillEl.style.width = "100%";
        labelEl.textContent = label(TOTAL);
        resultEl.classList.add("is-on");
        return;
      }
      later(() => type(() => progress(() => {
        resultEl.classList.add("is-on");
        later(loop, 5600);
      })), 500);
    }
    new IntersectionObserver((es, io) => {
      if (es[0].isIntersecting) { loop(); io.disconnect(); }
    }, { threshold: 0.3 }).observe(typedEl.closest(".chatui"));
  }

  /* ───── FAQ exclusivo ───── */
  document.querySelectorAll(".faq__item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        document.querySelectorAll(".faq__item[open]").forEach((o) => { if (o !== item) o.open = false; });
      }
    });
  });
})();
