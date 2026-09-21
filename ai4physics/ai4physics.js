"use strict";
(() => {
  const root = document.documentElement;
  const button = document.querySelector("#theme-button");
  const media = matchMedia("(prefers-color-scheme: dark)");
  const theme = () => root.dataset.theme || (media.matches ? "dark" : "light");
  const sync = () => { const dark = theme() === "dark"; button.innerHTML = `${dark ? "☼" : "◐"} <span>${dark ? "稿纸" : "黑板"}</span>`; button.setAttribute("aria-label", dark ? "切换到稿纸模式" : "切换到黑板模式"); document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue("--bg").trim(); };
  button.addEventListener("click", () => { const next = theme() === "dark" ? "light" : "dark"; root.dataset.theme = next; try { localStorage.setItem("setsuna-theme", next); } catch (_) {} sync(); });
  media.addEventListener?.("change", () => { if (!root.dataset.theme) sync(); }); sync();
})();
