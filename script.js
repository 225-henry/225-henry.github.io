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
    const width = 210 + Math.round(Math.random() * 300);
    const mobileWidth = 220 + Math.round(Math.random() * 140);
    const phoneWidth = 38 + Math.round(Math.random() * 34);
    const shouldAddVoid = index > 0 && index % (3 + Math.floor(Math.random() * 3)) === 0;

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
      card.style.setProperty("--void-width", `${220 + Math.round(Math.random() * 180)}px`);
      card.style.setProperty("--void-height", `${120 + Math.round(Math.random() * 180)}px`);
    }

    projectIndex.appendChild(card);
  });
}
