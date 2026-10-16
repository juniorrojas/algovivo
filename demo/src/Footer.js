const repoUrl = "https://github.com/juniorrojas/algovivo";

export default class Footer {
  constructor() {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    this.domElement = footer;

    footer.innerHTML = `
<div class="footer-bar">
  <div class="footer-brand">algovivo</div>
  <a class="footer-link" href="${repoUrl}">GitHub</a>
</div>`;
  }
}
