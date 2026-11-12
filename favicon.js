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

function createMovingTriangle() {
  const marker = document.createElement("span");
  marker.className = "moving-hover-marker";
  marker.setAttribute("aria-hidden", "true");
  document.body.appendChild(marker);
  let activeTarget;
  let motion;

  const moveTo = (target, animate = true) => {
    const card = target.closest(".project-card");
    const label = card ? card.querySelector(".number") : target;
    const bounds = label.getBoundingClientRect();
    const fontSize = parseFloat(getComputedStyle(label).fontSize);
    const pointsLeft = target.hasAttribute("data-marker-left");
    const x = pointsLeft ? bounds.right + fontSize * 0.18 : bounds.left - (card ? 18 : fontSize * 0.95);
    const transform = `translate(${x}px, ${bounds.top + bounds.height / 2}px) translateY(-50%)`;
    const previous = getComputedStyle(marker).transform;
    motion?.cancel();
    marker.classList.toggle("is-header", !card);
    marker.classList.toggle("points-left", pointsLeft);
    marker.style.setProperty("--marker-color", getComputedStyle(card || target).getPropertyValue(card ? "--hover-marker-color" : "--text-hover-color"));
    marker.style.transform = transform;
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const keyframes = activeTarget
        ? [{ transform: previous }, { transform }]
        : [{ transform: `${transform} scale(0.65)`, opacity: 0 }, { transform, opacity: 1 }];
      motion = marker.animate(keyframes, {
        duration: 220,
        easing: "ease-out"
      });
    }
    marker.classList.add("is-visible");
    activeTarget = target;
  };

  const followTarget = (event) => {
    if (event.pointerType === "touch") return;
    const target = event.target.closest(".topbar a, .project-card a, .info-catalog-list a, .info-links a");
    if (target && target !== activeTarget) moveTo(target);
  };
  document.addEventListener("pointerover", followTarget);
  document.addEventListener("focusin", followTarget);
  const reposition = () => activeTarget && moveTo(activeTarget, false);
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, { passive: true });
  document.addEventListener("load", reposition, true);
}

createMovingTriangle();
