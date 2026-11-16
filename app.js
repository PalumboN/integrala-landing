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
          disconnected: { title: "Desconectado", text: "Sistemas, datos, procesos e IA existen, pero cada uno opera aislado." },
          connected: { title: "Conectado", text: "Las conexiones activas permiten que la información y las decisiones fluyan con continuidad entre los temas." },
          evolving: { title: "Evolucionando", text: "Cada nodo puede evolucionar y dividirse en nuevas partes sin reconstruir la base del ecosistema." }
        },
        nodes: {
          core: { title: "INTEGRALA", text: "Núcleo que conecta y orquesta sistemas, datos, procesos e IA con un criterio común." },
          systems: { title: "Sistemas", text: "Aplicaciones y servicios que sostienen la operación y se integran con el resto del entorno." },
          data: { title: "Datos", text: "Información compartida con trazabilidad y consistencia para alimentar decisiones y procesos." },
          processes: { title: "Procesos", text: "Flujos de trabajo que coordinan personas, reglas y sistemas en cada etapa." },
          ai: { title: "IA", text: "Capacidades inteligentes aplicadas donde aportan valor, conectadas al contexto real." }
        }
      },
      en: {
        scenario: "Scenario",
        node: "Node",
        scenarios: {
          disconnected: { title: "Disconnected", text: "Systems, data, processes and AI exist, but each one operates in isolation." },
          connected: { title: "Connected", text: "Active connections let information and decisions flow continuously between the topics." },
          evolving: { title: "Evolving", text: "Each node can evolve and split into new parts without rebuilding the ecosystem's foundation." }
        },
        nodes: {
          core: { title: "INTEGRALA", text: "The core that connects and orchestrates systems, data, processes and AI with a shared approach." },
          systems: { title: "Systems", text: "Applications and services that support operations and integrate with the rest of the environment." },
          data: { title: "Data", text: "Shared information with traceability and consistency to inform decisions and processes." },
          processes: { title: "Processes", text: "Workflows that coordinate people, rules and systems at every stage." },
          ai: { title: "AI", text: "Intelligent capabilities applied where they add value, connected to real context." }
        }
      }
    };

    var currentScenario = "disconnected";
    var pinnedNode = "core";
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
  })();
})();
