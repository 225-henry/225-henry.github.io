const textHoverColors = ["#25abe2", "#e80415", "#fef900"];
let activeLink = null;

function getHoverLink(event) {
  const link = event.target.closest("a");

  if (!link || link.closest(".project-card")) {
    return null;
  }

  return link;
}

function getHoverColor(link) {
  const links = [...document.querySelectorAll("a:not(.project-card a)")];
  const index = Math.max(0, links.indexOf(link));
  return textHoverColors[index % textHoverColors.length];
}

function clearActiveLink() {
  if (activeLink) {
    activeLink.style.removeProperty("color");
    activeLink = null;
  }
}

document.addEventListener("pointermove", (event) => {
  const link = getHoverLink(event);

  if (link !== activeLink) {
    clearActiveLink();
    activeLink = link;
  }

  if (activeLink) {
    activeLink.style.setProperty("color", getHoverColor(activeLink), "important");
  }
});

document.addEventListener("pointerleave", clearActiveLink);
document.addEventListener("scroll", () => {
  const hoveredLink = document.querySelector("a:hover:not(.project-card a)");

  if (!hoveredLink) {
    clearActiveLink();
  }
});
