const projectIndex = document.querySelector(".project-index");
const images = window.portfolioImages || [];
const imageMap = new Map(images.map((image) => [image.number, image]));
const layoutStorageKey = "home-layout-v1";
const returnImageKey = "home-return-image";
const hoverSquareColors = ["#25abe2", "#e80415", "#fef900"];
const homeImageLimit = 50;
const homeImageGroups = [
  { range: ["001", "014"] },
  { range: ["015", "020"] },
  { range: ["021", "044"] },
  { range: ["045", "047"] },
  { range: ["048", "052"] },
  { range: ["053", "055"] },
  { range: ["056", "065"], max: 2 },
  { range: ["066", "075"], max: 2 }
];

function createProjectCard(image, isPriority = false) {
  const card = document.createElement("article");
  const link = document.createElement("a");
  const number = document.createElement("span");
  const picture = document.createElement("img");

  card.className = "project-card";
  card.dataset.number = image.number;
  link.href = `viewer.html?image=${encodeURIComponent(image.number)}`;
  number.className = "number";
  number.textContent = image.number;
  picture.src = image.src.trim();
  picture.alt = image.alt || "";
  picture.loading = isPriority ? "eager" : "lazy";
  picture.decoding = "async";
  picture.fetchPriority = isPriority ? "high" : "low";

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

function randomBetween(min, max) {
  return min + Math.round(Math.random() * (max - min));
}

function numberValue(number) {
  return Number.parseInt(number, 10);
}

function shuffleList(list) {
  const shuffled = [...list];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function getImagesInRange(start, end) {
  const startValue = numberValue(start);
  const endValue = numberValue(end);

  return images.filter((image) => {
    const value = numberValue(image.number);
    return value >= startValue && value <= endValue;
  });
}

function getBalancedHomeImages() {
  const groupedImages = homeImageGroups
    .map(({ range, max }) => {
      const [start, end] = range;
      const group = shuffleList(getImagesInRange(start, end));
      return typeof max === "number" ? group.slice(0, max) : group;
    })
    .filter((group) => group.length > 0);
  const selectedImages = [];

  while (selectedImages.length < homeImageLimit && groupedImages.some((group) => group.length > 0)) {
    groupedImages.forEach((group) => {
      if (selectedImages.length < homeImageLimit && group.length > 0) {
        selectedImages.push(group.shift());
      }
    });
  }

  return selectedImages;
}

function createLayoutItem(image, index) {
  const isGif = image.src.toLowerCase().includes(".gif");
  const sizeRoll = Math.random();
  const isOpeningImage = index < 4;
  const width =
    isGif
      ? randomBetween(500, 660)
      : sizeRoll < 0.32
        ? randomBetween(210, 330)
        : sizeRoll < 0.74
          ? randomBetween(290, 430)
          : randomBetween(380, 490);
  const mobileWidth =
    isGif
      ? randomBetween(330, 420)
      : sizeRoll < 0.32
        ? randomBetween(210, 290)
        : sizeRoll < 0.74
          ? randomBetween(230, 350)
          : randomBetween(300, 390);
  const phoneWidth =
    isGif
      ? randomBetween(32, 40)
      : sizeRoll < 0.32
        ? randomBetween(18, 26)
        : sizeRoll < 0.74
          ? randomBetween(22, 32)
          : randomBetween(28, 38);

  return {
    type: "image",
    number: image.number,
    styles: {
      "--card-width": `${width}px`,
      "--mobile-card-width": `${mobileWidth}px`,
      "--phone-card-width": `${phoneWidth}%`,
      "--phone-space-top": `${randomBetween(4, 56)}px`,
      "--phone-space-right": `${randomBetween(8, 22)}px`,
      "--phone-space-bottom": `${randomBetween(26, 72)}px`,
      "--phone-space-left": `${randomBetween(6, 18)}px`,
      "--phone-offset-x": `${randomBetween(-8, 8)}px`,
      "--phone-offset-y": `${randomBetween(0, 20)}px`,
      "--space-top": `${isOpeningImage ? randomBetween(0, 34) : randomBetween(30, 220)}px`,
      "--space-right": `${randomBetween(35, 215)}px`,
      "--space-bottom": `${randomBetween(55, 275)}px`,
      "--space-left": `${randomBetween(0, 130)}px`,
      "--offset-x": `${randomBetween(-45, 45)}px`,
      "--offset-y": `${randomBetween(-60, 60)}px`,
      "--card-align": ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)],
      "--hover-square-color": hoverSquareColors[Math.floor(Math.random() * hoverSquareColors.length)]
    }
  };
}

function createVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(260, 780)}px`,
      "--void-height": `${randomBetween(160, 580)}px`,
      "--void-margin": `${randomBetween(0, 140)}px ${randomBetween(0, 220)}px`
    }
  };
}

function createRandomLayout() {
  const shuffledImages = shuffleList(getBalancedHomeImages());
  const layout = [];

  shuffledImages.forEach((image, index) => {
    layout.push(createLayoutItem(image, index));

    if (index > 0 && (index % 6 === 0 || Math.random() > 0.88)) {
      layout.push(createVoidItem());
    }
  });

  return layout;
}

function applyStyles(element, styles) {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

function renderLayout(layout) {
  let imageCount = 0;
  const fragment = document.createDocumentFragment();

  layout.forEach((item) => {
    if (item.type === "void") {
      const voidElement = document.createElement("div");
      voidElement.className = "layout-void";
      applyStyles(voidElement, item.styles);
      fragment.appendChild(voidElement);
      return;
    }

    const image = imageMap.get(item.number);

    if (!image) {
      return;
    }

    const card = createProjectCard(image, imageCount < 6);
    imageCount += 1;
    applyStyles(card, item.styles);

    fragment.appendChild(card);
  });

  projectIndex.appendChild(fragment);
}

function scrollToReturnedImage() {
  const imageNumber = sessionStorage.getItem(returnImageKey);

  if (!imageNumber) {
    return;
  }

  const returnedCard = document.querySelector(`.project-card[data-number="${imageNumber}"]`);

  if (returnedCard) {
    returnedCard.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    sessionStorage.removeItem(returnImageKey);
  }
}

if (projectIndex) {
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  const isReload = navigationEntry?.type === "reload";
  const savedLayout = sessionStorage.getItem(layoutStorageKey);
  const layout = !isReload && savedLayout ? JSON.parse(savedLayout) : createRandomLayout();

  projectIndex.addEventListener("click", (event) => {
    const card = event.target.closest(".project-card");

    if (card) {
      sessionStorage.setItem(returnImageKey, card.dataset.number);
    }
  });

  sessionStorage.setItem(layoutStorageKey, JSON.stringify(layout));
  renderLayout(layout);
  scrollToReturnedImage();
}

window.addEventListener("pageshow", scrollToReturnedImage);
