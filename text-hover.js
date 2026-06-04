const textHoverColors = ["#25abe2", "#e80415", "#fef900"];

document.querySelectorAll("a").forEach((link) => {
  if (link.closest(".project-card")) {
    return;
  }

  const color = textHoverColors[Math.floor(Math.random() * textHoverColors.length)];
  link.style.setProperty("--text-hover-color", color);
});
