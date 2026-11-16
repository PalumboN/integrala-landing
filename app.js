/* INTEGRALA — theme switch + small page behaviour.
   Everything here is progressive enhancement: the page is fully readable
   and crawlable with JavaScript disabled. */
(function () {
  "use strict";

  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  var themeMeta = document.querySelector('meta[name="theme-color"]:not([media])');

  var THEME_COLOR = { gray: "#f1f1ef", dark: "#101113" };

  function apply(theme) {
    if (theme !== "dark") theme = "gray";
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("integrala-theme", theme); } catch (e) {}
    if (toggle) toggle.setAttribute("aria-checked", String(theme === "dark"));
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLOR[theme]);
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      apply(root.getAttribute("data-theme") === "dark" ? "gray" : "dark");
    });
  }

  apply(root.getAttribute("data-theme"));

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
