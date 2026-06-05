const faviconColors = ["#25abe2", "#e80415", "#fef900"];
const favicon = document.querySelector('link[rel="icon"]') || document.createElement("link");
const faviconColor = faviconColors[Math.floor(Math.random() * faviconColors.length)];
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="${faviconColor}"/></svg>`;

favicon.rel = "icon";
favicon.type = "image/svg+xml";
favicon.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
document.head.appendChild(favicon);

document.querySelectorAll("a").forEach((link) => {
  if (!link.closest(".project-card")) {
    const color = faviconColors[Math.floor(Math.random() * faviconColors.length)];
    link.style.setProperty("--text-hover-color", color);
  }
});

document.querySelectorAll("[data-work-count-menu]").forEach((button) => {
  const color = faviconColors[Math.floor(Math.random() * faviconColors.length)];
  button.style.setProperty("--text-hover-color", color);
});
