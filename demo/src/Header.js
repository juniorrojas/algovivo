import { githubIcon } from "./ui.js";

const repoUrl = "https://github.com/juniorrojas/algovivo";

export default class Header {
  constructor() {
    const nav = document.createElement("nav");
    nav.className = "header-nav";
    this.nav = nav;
    nav.innerHTML = `
<div class="header-nav-inner">
  <a class="nav-title" href="./">algovivo</a>
  <a class="header-github" href="${repoUrl}">${githubIcon(16)}<span>GitHub</span></a>
</div>`;

    const header = document.createElement("header");
    header.className = "site-header";
    this.domElement = header;
    header.innerHTML = `
<h1>algovivo</h1>
<p>an energy-based formulation for soft-bodied virtual creatures</p>`;

    const title = header.querySelector("h1");
    new IntersectionObserver((entries) => {
      nav.classList.toggle("scrolled", !entries[entries.length - 1].isIntersecting);
    }, { rootMargin: "-60px 0px 0px 0px" }).observe(title);
  }
}
