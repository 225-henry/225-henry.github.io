const faviconColors = ["#25abe2", "#e80415", "#fef900"];
const favicon = document.querySelector('link[rel="icon"]');
const faviconColor = faviconColors[Math.floor(Math.random() * faviconColors.length)];
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="${faviconColor}"/></svg>`;

if (favicon) {
  favicon.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
}
