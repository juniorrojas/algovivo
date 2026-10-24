const related = [
  {
    title: "algovivo in 3D",
    text: "locomotion with tetrahedral meshes",
    href: "https://x.com/junior_rojas_d/status/2088870900578074922",
    image: "more/algovivo3d.webp"
  },
  {
    title: "morphology-adaptive muscle driven locomotion via attention mechanisms",
    text: "GECCO 2025 EvoSelf Workshop",
    href: "https://github.com/juniorrojas/morphology-adaptive",
    image: "more/morphology-adaptive.webp"
  }
];

export default {
  title: "more",
  dark: true,
  content: `<div class="more-grid">
${related.map((r) => `<a class="more-card" href="${r.href}">
  <img src="${r.image}" alt="${r.title}" loading="lazy">
  <div class="more-body">
    <div class="more-title">${r.title}</div>
    <div class="more-text">${r.text}</div>
  </div>
</a>`).join("\n")}
</div>`
};
