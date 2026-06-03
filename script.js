const projectIndex = document.querySelector(".project-index");
const images = window.portfolioImages || [];

function createProjectCard(image) {
  const card = document.createElement("article");
  const link = document.createElement("a");
  const number = document.createElement("span");
  const picture = document.createElement("img");

  card.className = "project-card";
  card.dataset.number = image.number;
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

const lightbox = document.createElement("div");
const lightboxImage = document.createElement("img");

lightbox.className = "lightbox";
lightbox.setAttribute("aria-hidden", "true");
lightbox.appendChild(lightboxImage);
document.body.appendChild(lightbox);

function openLightbox(image) {
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt || "";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

lightbox.addEventListener("click", closeLightbox);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

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
        ? 210 + Math.round(Math.random() * 120)
        : sizeRoll < 0.74
          ? 290 + Math.round(Math.random() * 170)
          : 400 + Math.round(Math.random() * 160);
    const mobileWidth =
      isGif
        ? 350 + Math.round(Math.random() * 120)
        : sizeRoll < 0.32
        ? 210 + Math.round(Math.random() * 80)
        : sizeRoll < 0.74
          ? 230 + Math.round(Math.random() * 120)
          : 320 + Math.round(Math.random() * 120);
    const phoneWidth =
      isGif
        ? 58 + Math.round(Math.random() * 12)
        : sizeRoll < 0.32
        ? 30 + Math.round(Math.random() * 12)
        : sizeRoll < 0.74
          ? 34 + Math.round(Math.random() * 14)
          : 46 + Math.round(Math.random() * 16);
    const shouldAddVoid = index > 0 && (index % 2 === 0 || Math.random() > 0.58);

    card.style.setProperty("--card-width", `${width}px`);
    card.style.setProperty("--mobile-card-width", `${mobileWidth}px`);
    card.style.setProperty("--phone-card-width", `${phoneWidth}%`);
    card.style.setProperty("--phone-space-top", `${Math.round(Math.random() * 64)}px`);
    card.style.setProperty("--phone-space-right", `${Math.round(Math.random() * 28)}px`);
    card.style.setProperty("--phone-space-bottom", `${28 + Math.round(Math.random() * 86)}px`);
    card.style.setProperty("--phone-space-left", `${Math.round(Math.random() * 22)}px`);
    card.style.setProperty("--phone-offset-x", `${Math.round(Math.random() * 30 - 15)}px`);
    card.style.setProperty("--phone-offset-y", `${Math.round(Math.random() * 64 - 32)}px`);
    card.style.setProperty("--space-top", `${30 + Math.round(Math.random() * 190)}px`);
    card.style.setProperty("--space-right", `${35 + Math.round(Math.random() * 180)}px`);
    card.style.setProperty("--space-bottom", `${55 + Math.round(Math.random() * 220)}px`);
    card.style.setProperty("--space-left", `${Math.round(Math.random() * 130)}px`);
    card.style.setProperty("--offset-x", `${Math.round(Math.random() * 90 - 45)}px`);
    card.style.setProperty("--offset-y", `${Math.round(Math.random() * 120 - 60)}px`);
    card.style.setProperty("--card-align", ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)]);

    if (shouldAddVoid) {
      card.classList.add("has-void");
      card.style.setProperty("--void-width", `${460 + Math.round(Math.random() * 520)}px`);
      card.style.setProperty("--void-height", `${320 + Math.round(Math.random() * 500)}px`);
    }

    card.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(image);
    });

    projectIndex.appendChild(card);

    if (index > 0 && (index % 4 === 0 || Math.random() > 0.78)) {
      const voidElement = document.createElement("div");
      voidElement.className = "layout-void";
      voidElement.style.setProperty("--void-width", `${260 + Math.round(Math.random() * 520)}px`);
      voidElement.style.setProperty("--void-height", `${160 + Math.round(Math.random() * 420)}px`);
      voidElement.style.setProperty("--void-margin", `${Math.round(Math.random() * 140)}px ${Math.round(Math.random() * 220)}px`);
      projectIndex.appendChild(voidElement);
    }
  });
}
