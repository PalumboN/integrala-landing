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
  }

  Array.prototype.forEach.call(langButtons, function (btn) {
    btn.addEventListener("click", function () { applyLang(btn.getAttribute("data-lang-set")); });
  });

  applyLang(root.getAttribute("data-lang"));

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
