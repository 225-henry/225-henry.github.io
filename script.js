const projectIndex = document.querySelector(".project-index");
const images = window.portfolioImages || [];

function createProjectCard(image) {
  const card = document.createElement("article");
  const link = document.createElement("a");
  const number = document.createElement("span");
  const picture = document.createElement("img");

  card.className = "project-card";
  link.href = `#project-${image.number}`;
  number.className = "number";
  number.textContent = image.number;
  picture.src = image.src;
  picture.alt = image.alt || "";

  link.append(number, picture);

  if (image.title) {
    const caption = document.createElement("span");
    caption.className = "caption";
    caption.textContent = image.title;
    link.appendChild(caption);
  }

  card.appendChild(link);
  return card;
}

if (projectIndex) {
  const shuffledImages = [...images].sort(() => Math.random() - 0.5);

  shuffledImages.forEach((image, index) => {
    const card = createProjectCard(image);
    const isGif = image.src.toLowerCase().includes(".gif");
    const sizeRoll = Math.random();
    const width =
      isGif
        ? 560 + Math.round(Math.random() * 220)
        : sizeRoll < 0.32
        ? 170 + Math.round(Math.random() * 120)
        : sizeRoll < 0.74
          ? 290 + Math.round(Math.random() * 170)
          : 400 + Math.round(Math.random() * 160);
    const mobileWidth =
      isGif
        ? 350 + Math.round(Math.random() * 120)
        : sizeRoll < 0.32
        ? 180 + Math.round(Math.random() * 80)
        : sizeRoll < 0.74
          ? 230 + Math.round(Math.random() * 120)
          : 320 + Math.round(Math.random() * 120);
    const phoneWidth =
      isGif
        ? 72 + Math.round(Math.random() * 14)
        : sizeRoll < 0.32
        ? 34 + Math.round(Math.random() * 14)
        : sizeRoll < 0.74
          ? 42 + Math.round(Math.random() * 18)
          : 58 + Math.round(Math.random() * 20);
    const shouldAddVoid = index > 0 && (index % 2 === 0 || Math.random() > 0.58);

    card.style.setProperty("--card-width", `${width}px`);
    card.style.setProperty("--mobile-card-width", `${mobileWidth}px`);
    card.style.setProperty("--phone-card-width", `${phoneWidth}%`);
    card.style.setProperty("--space-top", `${30 + Math.round(Math.random() * 190)}px`);
    card.style.setProperty("--space-right", `${35 + Math.round(Math.random() * 180)}px`);
    card.style.setProperty("--space-bottom", `${55 + Math.round(Math.random() * 220)}px`);
    card.style.setProperty("--space-left", `${Math.round(Math.random() * 130)}px`);
    card.style.setProperty("--card-align", ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)]);

    if (shouldAddVoid) {
      card.classList.add("has-void");
      card.style.setProperty("--void-width", `${460 + Math.round(Math.random() * 520)}px`);
      card.style.setProperty("--void-height", `${320 + Math.round(Math.random() * 500)}px`);
    }

    projectIndex.appendChild(card);
  });
}
