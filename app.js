/* INTEGRALA — theme switch, language switch and small page behaviour.
   Everything here is progressive enhancement: the page is fully readable
   and crawlable with JavaScript disabled. Spanish is the default and is
   present directly in the HTML; English lives in data-en* attributes. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var toggle = document.querySelector("[data-theme-toggle]");
  var themeMeta = document.querySelector('meta[name="theme-color"]:not([media])');
  var THEME_COLOR = { gray: "#f1f1ef", dark: "#101113" };

  function applyTheme(theme) {
    if (theme !== "dark") theme = "gray";
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("integrala-theme", theme); } catch (e) {}
    if (toggle) toggle.setAttribute("aria-checked", String(theme === "dark"));
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLOR[theme]);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "gray" : "dark");
    });
  }

  applyTheme(root.getAttribute("data-theme"));

  /* ---------- Language ---------- */
  var langButtons = document.querySelectorAll("[data-lang-set]");
  var ATTRS = [
    { en: "data-en", target: "text" },
    { en: "data-en-html", target: "html" },
    { en: "data-en-aria-label", target: "aria-label" },
    { en: "data-en-title", target: "title" }
  ];

  /* Remember the original (Spanish) values once, so we can switch back.
     Only elements that carry translated text are rewritten via innerHTML;
     attribute-only elements just get their attribute restored. */
  var originals = [];
  Array.prototype.forEach.call(document.querySelectorAll("[data-en],[data-en-html],[data-en-aria-label],[data-en-title]"), function (el) {
    var rec = {
      el: el,
      hasText: el.hasAttribute("data-en") || el.hasAttribute("data-en-html"),
      text: el.innerHTML,
      attrs: {}
    };
    ATTRS.forEach(function (a) {
      if (el.hasAttribute(a.en) && a.target !== "text" && a.target !== "html") {
        rec.attrs[a.target] = el.getAttribute(a.target);
      }
    });
    originals.push(rec);
  });

  function applyLang(lang) {
    if (lang !== "en") lang = "es";
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    try { localStorage.setItem("integrala-lang", lang); } catch (e) {}

    originals.forEach(function (rec) {
      var el = rec.el;
      if (lang === "en") {
        ATTRS.forEach(function (a) {
          if (!el.hasAttribute(a.en)) return;
          var val = el.getAttribute(a.en);
          if (a.target === "text") el.textContent = val;
          else if (a.target === "html") el.innerHTML = val;
          else el.setAttribute(a.target, val);
        });
      } else {
        if (rec.hasText) el.innerHTML = rec.text;
        Object.keys(rec.attrs).forEach(function (k) { el.setAttribute(k, rec.attrs[k]); });
      }
    });

    Array.prototype.forEach.call(langButtons, function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang-set") === lang));
    });

    if (typeof window.__integralaRefreshEcosystem === "function") {
      window.__integralaRefreshEcosystem();
    }
  }

  Array.prototype.forEach.call(langButtons, function (btn) {
    btn.addEventListener("click", function () { applyLang(btn.getAttribute("data-lang-set")); });
  });

  applyLang(root.getAttribute("data-lang"));

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Ecosystem visualization ---------- */
  (function () {
    var stage = document.querySelector("#ecosystem .eco-stage");
    if (!stage) return;

    var figure = document.getElementById("ecosystem");
    var infoKicker = figure ? figure.querySelector(".eco-info-kicker") : null;
    var infoTitle = document.getElementById("eco-info-title");
    var infoText = document.getElementById("eco-info-text");
    var scenarioButtons = Array.prototype.slice.call(document.querySelectorAll(".eco-scenario"));
    var nodes = Array.prototype.slice.call(stage.querySelectorAll(".eco-node"));
    var links = Array.prototype.slice.call(stage.querySelectorAll(".eco-link"));
    var flows = Array.prototype.slice.call(stage.querySelectorAll(".eco-flow"));

    var i18n = {
      es: {
        scenario: "Escenario",
        node: "Nodo",
        scenarios: {
          disconnected: { title: "Desconectado", text: "Sistemas, datos, procesos y herramientas existen, pero cada uno opera aislado." },
          connected: { title: "Conectado", text: "Las conexiones activas permiten que la información y el trabajo fluyan con continuidad." },
          evolving: { title: "Evolucionando", text: "Cada parte puede crecer y adaptarse a nuevas necesidades sin reconstruir todo desde cero." }
        },
        nodes: {
          core: { title: "INTEGRALA", text: "Criterio de ingeniería para conectar, ordenar y hacer evolucionar cómo funciona el negocio." },
          systems: { title: "Sistemas", text: "Aplicaciones y servicios que sostienen la operación y necesitan trabajar en conjunto." },
          data: { title: "Datos", text: "Información confiable y disponible para que circule entre áreas, herramientas y decisiones." },
          processes: { title: "Procesos", text: "Formas de trabajo que coordinan personas, tareas y sistemas en el día a día." },
          ai: { title: "Herramientas", text: "Nuevas tecnología integradas al funcionamiento real del negocio." }
        }
      },
      en: {
        scenario: "Scenario",
        node: "Node",
        scenarios: {
          disconnected: { title: "Disconnected", text: "Systems, data, processes and tools exist, but each one operates in isolation." },
          connected: { title: "Connected", text: "Active connections let information and work flow continuously." },
          evolving: { title: "Evolving", text: "Each part can grow and adapt to new needs without rebuilding everything from scratch." }
        },
        nodes: {
          core: { title: "INTEGRALA", text: "Engineering judgment to connect, organize, and evolve how the business operates." },
          systems: { title: "Systems", text: "Applications and services that support operations and need to work together." },
          data: { title: "Data", text: "Reliable information available to flow across teams, tools, and decisions." },
          processes: { title: "Processes", text: "Ways of working that coordinate people, tasks, and systems day to day." },
          ai: { title: "Tools", text: "New technologies integrated into how the business actually works." }
        }
      }
    };

    var currentScenario = "connected";
    var pinnedNode = null;
    var hoverNode = null;

    function lang() { return root.getAttribute("data-lang") === "en" ? "en" : "es"; }
    function t() { return i18n[lang()]; }

    function setInfo(kind, key) {
      var dict = t();
      var item = kind === "node" ? dict.nodes[key] : dict.scenarios[key];
      if (!item) return;
      if (infoKicker) infoKicker.textContent = kind === "node" ? dict.node : dict.scenario;
      if (infoTitle) infoTitle.textContent = item.title;
      if (infoText) infoText.textContent = item.text;
    }

    function displayNodeKey() { return hoverNode || pinnedNode; }
    function activeNodeKey() { return hoverNode || pinnedNode; }

    function syncVisualState() {
      var display = displayNodeKey();
      var active = activeNodeKey();
      stage.setAttribute("data-scenario", currentScenario);
      stage.classList.toggle("has-focus", !!active);

      scenarioButtons.forEach(function (btn) {
        var on = btn.getAttribute("data-scenario") === currentScenario;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", String(on));
      });

      nodes.forEach(function (node) {
        var key = node.getAttribute("data-node");
        node.setAttribute("aria-hidden", "false");
        node.setAttribute("tabindex", "0");
        node.classList.toggle("is-selected", key === pinnedNode);
        node.classList.toggle("is-active", key === active);
        node.classList.toggle("is-dimmed", !!active && key !== active);
        node.setAttribute("aria-pressed", String(key === pinnedNode));
      });

      links.forEach(function (link) {
        var key = link.getAttribute("data-link");
        link.classList.toggle("is-active", key === active);
      });
      flows.forEach(function (flow) {
        var key = flow.getAttribute("data-flow");
        flow.classList.toggle("is-active", key === active);
      });

      if (display && t().nodes[display]) setInfo("node", display);
      else setInfo("node", "core");
    }

    function setScenario(next) {
      currentScenario = next;
      pinnedNode = null;
      hoverNode = null;
      syncVisualState();
    }

    function setPinned(nodeKey) {
      pinnedNode = nodeKey;
      syncVisualState();
    }

    scenarioButtons.forEach(function (btn) {
      btn.addEventListener("click", function () { setScenario(btn.getAttribute("data-scenario")); });
    });

    nodes.forEach(function (node) {
      var key = node.getAttribute("data-node");
      node.addEventListener("mouseenter", function () { hoverNode = key; syncVisualState(); });
      node.addEventListener("mouseleave", function () { hoverNode = null; syncVisualState(); });
      node.addEventListener("focus", function () { hoverNode = key; syncVisualState(); });
      node.addEventListener("blur", function () { hoverNode = null; syncVisualState(); });
      node.addEventListener("click", function (e) { e.preventDefault(); setPinned(key); });
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPinned(key); }
      });
    });

    window.__integralaRefreshEcosystem = function () { syncVisualState(); };
    syncVisualState();

    /* Mobile carousel */
    (function () {
      var carousel = figure ? figure.querySelector(".eco-carousel") : null;
      if (!carousel) return;
      var track = carousel.querySelector(".eco-carousel-track");
      var dotsWrap = carousel.querySelector(".eco-dots");
      var cards = track ? Array.prototype.slice.call(track.querySelectorAll(".eco-card")) : [];
      if (!track || !dotsWrap || !cards.length) return;

      var idx = 0;
      var timer = null;

      cards.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "eco-dot" + (i === 0 ? " is-active" : "");
        b.setAttribute("aria-label", String(i + 1));
        b.addEventListener("click", function () { go(i, true); });
        dotsWrap.appendChild(b);
      });
      var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll(".eco-dot"));

      function setActive(i) {
        idx = i;
        dots.forEach(function (d, j) { d.classList.toggle("is-active", j === i); });
      }

      function go(i, manual) {
        i = (i + cards.length) % cards.length;
        track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
        setActive(i);
        if (manual) restart();
      }

      function onScroll() {
        var w = track.clientWidth || 1;
        var i = Math.round(track.scrollLeft / w);
        if (i < 0) i = 0;
        if (i >= cards.length) i = cards.length - 1;
        setActive(i);
      }

      var scrollTimer;
      track.addEventListener("scroll", function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(onScroll, 80);
      }, { passive: true });

      function start() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        stop();
        timer = setInterval(function () { go(idx + 1, false); }, 3800);
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function restart() { stop(); start(); }

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      carousel.addEventListener("touchstart", stop, { passive: true });
      carousel.addEventListener("touchend", start, { passive: true });

      start();
    })();
  })();
})();
