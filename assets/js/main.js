/* ============================================================
   HARPIÖ MIND · interações da landing
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header: estado de scroll ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- menu mobile ---------- */
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

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- tabs · 7 pilares ---------- */
  const tabButtons = document.querySelectorAll(".tabs__btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      document.querySelectorAll(".tabs__panel").forEach((p) => {
        p.hidden = true;
        p.classList.remove("is-active");
      });
      const panel = document.getElementById("tab-" + btn.dataset.tab);
      if (panel) {
        panel.hidden = false;
        panel.classList.add("is-active");
      }
    });
  });

  /* ---------- contador grande ---------- */
  const counter = document.getElementById("big-counter");
  if (counter) {
    const target = parseInt(counter.dataset.target, 10) || 0;
    const fmt = new Intl.NumberFormat("pt-BR");
    const animate = () => {
      if (prefersReducedMotion) {
        counter.textContent = fmt.format(target);
        return;
      }
      const dur = 2200;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4); // ease-out-quart
        counter.textContent = fmt.format(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animate();
          io.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    io.observe(counter);
  }

  /* ---------- hero: simulação de atribuição de tarefa ---------- */
  const typedEl = document.getElementById("typed-cmd");
  const replyEl = document.getElementById("agent-reply");
  const resultEl = document.getElementById("agent-result");
  const fillEl = document.getElementById("progress-fill");
  const labelEl = document.getElementById("progress-label");

  if (typedEl && replyEl && resultEl && fillEl && labelEl) {
    const COMMAND =
      "@Sofia tria os 240 currículos do Analista de Crédito Pleno e me devolve o top 20 até as 18h";
    const TOTAL = 240;
    const fmtLabel = (n) => `${n} de ${TOTAL} analisados`;
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };

    function reset() {
      typedEl.textContent = "";
      replyEl.style.opacity = "0.25";
      resultEl.classList.remove("is-on");
      fillEl.style.width = "0%";
      labelEl.textContent = fmtLabel(0);
    }

    function typeCommand(done) {
      let i = 0;
      const step = () => {
        typedEl.textContent = COMMAND.slice(0, i);
        i += 1;
        if (i <= COMMAND.length) {
          timers.push(setTimeout(step, 26 + Math.random() * 34));
        } else {
          done();
        }
      };
      step();
    }

    function runProgress(done) {
      replyEl.style.opacity = "1";
      replyEl.style.transition = "opacity .4s";
      const steps = [0.16, 0.34, 0.52, 0.71, 0.88, 1];
      steps.forEach((p, idx) => {
        later(() => {
          fillEl.style.width = `${Math.round(p * 100)}%`;
          labelEl.textContent = fmtLabel(Math.round(p * TOTAL));
          if (idx === steps.length - 1) later(done, 600);
        }, 520 * (idx + 1));
      });
    }

    function showResult(done) {
      resultEl.classList.add("is-on");
      later(done, 5200);
    }

    function loop() {
      clearTimers();
      reset();
      if (prefersReducedMotion) {
        typedEl.textContent = COMMAND;
        replyEl.style.opacity = "1";
        fillEl.style.width = "100%";
        labelEl.textContent = fmtLabel(TOTAL);
        resultEl.classList.add("is-on");
        return;
      }
      later(() => typeCommand(() => runProgress(() => showResult(loop))), 600);
    }

    // só roda quando o hero está visível
    const heroIO = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loop();
          heroIO.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    heroIO.observe(typedEl.closest(".chatcard"));
  }

  /* ---------- FAQ: fecha os irmãos ao abrir um ---------- */
  document.querySelectorAll(".faq__item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        document.querySelectorAll(".faq__item[open]").forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
