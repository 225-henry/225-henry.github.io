const projectIndex = document.querySelector(".project-index");
const images = window.portfolioImages || [];
const imageMap = new Map(images.map((image) => [image.number, image]));
const layoutStorageKey = "home-layout-v12";
const returnImageKey = "home-return-image";
const hoverSquareColors = ["#25abe2", "#e80415", "#fef900"];
const homeImageLimit = 60;
const homeImageGroups = [
  { range: ["001", "014"] },
  { range: ["015", "020"] },
  { range: ["021", "044"] },
  { range: ["045", "047"] },
  { range: ["048", "052"] },
  { ranges: [["053", "055"], ["075", "078"]] },
  { range: ["056", "065"], max: 3 },
  { range: ["066", "074"], max: 3 },
  { range: ["079", "082"] },
  { range: ["083", "085"] },
  { range: ["086", "087"] }
];

function createProjectCard(image, options = {}) {
  const { isPriority = false } = options;
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

function getImagesForGroup(group) {
  const ranges = group.ranges || [group.range];
  return ranges.flatMap(([start, end]) => getImagesInRange(start, end));
}

function getBalancedHomeImages() {
  const groupedImages = homeImageGroups
    .map((homeGroup) => {
      const group = shuffleList(getImagesForGroup(homeGroup));
      return typeof homeGroup.max === "number" ? group.slice(0, homeGroup.max) : group;
    })
    .filter((group) => group.length > 0);
  const totalImages = groupedImages.reduce((sum, group) => sum + group.length, 0);
  let remainingSlots = Math.min(homeImageLimit, totalImages);
  const quotas = groupedImages.map((group) => {
    const proportionalCount = Math.round((group.length / totalImages) * homeImageLimit);
    const count = Math.min(group.length, Math.max(1, proportionalCount));
    remainingSlots -= count;
    return count;
  });

  while (remainingSlots !== 0) {
    const candidates = groupedImages
      .map((group, index) => ({ group, index, room: group.length - quotas[index] }))
      .filter(({ index, room }) => (remainingSlots > 0 ? room > 0 : quotas[index] > 1));

    if (candidates.length === 0) {
      break;
    }

    const target = candidates.reduce((largest, candidate) => (candidate.room > largest.room ? candidate : largest));
    quotas[target.index] += remainingSlots > 0 ? 1 : -1;
    remainingSlots += remainingSlots > 0 ? -1 : 1;
  }

  return groupedImages.flatMap((group, index) => group.slice(0, quotas[index]));
}

function createLayoutItem(image, index, phoneFirstRowCount) {
  const isGif = image.src.toLowerCase().includes(".gif");
  const sizeRoll = Math.random();
  const isOpeningImage = index < 4;
  const titleLength = image.title ? image.title.length : 0;
  const titleBoost = titleLength > 22 ? clamp((titleLength - 22) * 1.6, 0, 46) : 0;
  const phoneTitleBoost = titleLength > 18 ? clamp((titleLength - 18) * 0.35, 0, 8) : 0;
  const widthBase =
    isGif
      ? randomBetween(450, 580)
      : sizeRoll < 0.32
        ? randomBetween(210, 330)
        : sizeRoll < 0.74
          ? randomBetween(290, 430)
          : randomBetween(360, 440);
  const mobileWidthBase =
    isGif
      ? randomBetween(310, 380)
      : sizeRoll < 0.32
        ? randomBetween(210, 290)
        : sizeRoll < 0.74
          ? randomBetween(230, 350)
          : randomBetween(280, 350);
  const phoneWidthBase =
    isGif
      ? randomBetween(32, 40)
      : sizeRoll < 0.32
        ? randomBetween(18, 26)
        : sizeRoll < 0.74
          ? randomBetween(22, 32)
          : randomBetween(28, 38);
  const width = clamp(widthBase + titleBoost, 210, 470);
  const mobileWidth = clamp(mobileWidthBase + titleBoost * 0.4, 210, 370);
  const phoneWidth = clamp(phoneWidthBase + phoneTitleBoost, 18, isOpeningImage ? 34 : 44);
  const phoneMaxWidth = isOpeningImage ? 34 : titleLength > 30 ? 48 : titleLength > 18 ? 42 : 38;

  return {
    type: "image",
    number: image.number,
    styles: {
      "--card-width": `${width}px`,
      "--mobile-card-width": `${mobileWidth}px`,
      "--phone-card-width": `${phoneWidth}%`,
      "--phone-card-max": `${phoneMaxWidth}%`,
      "--phone-space-top": `${isOpeningImage ? 0 : randomBetween(4, 56)}px`,
      "--phone-space-right": `${isOpeningImage ? randomBetween(18, 34) : randomBetween(0, 34)}px`,
      "--phone-space-bottom": `${randomBetween(22, 92)}px`,
      "--phone-space-left": `${isOpeningImage ? randomBetween(8, 18) : randomBetween(0, 42)}px`,
      "--phone-offset-x": `${isOpeningImage ? randomBetween(0, 4) : randomBetween(0, 28)}px`,
      "--phone-offset-y": `${randomBetween(0, 34)}px`,
      "--space-top": `${isOpeningImage ? 0 : randomBetween(30, 220)}px`,
      "--opening-clear": `${isOpeningImage ? 92 : 0}px`,
      "--phone-opening-clear": `${index < phoneFirstRowCount ? 54 : 0}px`,
      "--space-right": `${randomBetween(35, 215)}px`,
      "--space-bottom": `${randomBetween(55, 275)}px`,
      "--space-left": `${randomBetween(0, 130)}px`,
      "--offset-x": `${randomBetween(0, 45)}px`,
      "--offset-y": `${randomBetween(0, 60)}px`,
      "--card-align": ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)],
      "--phone-card-align": ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)],
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
  const phoneFirstRowCount = randomBetween(1, 3);
  const layout = [];

  shuffledImages.forEach((image, index) => {
    layout.push(createLayoutItem(image, index, phoneFirstRowCount));

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

    const card = createProjectCard(image, {
      isPriority: imageCount < 3
    });
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

function markFirstRowCards() {
  const cards = [...document.querySelectorAll(".project-card")];

  cards.forEach((card) => {
    delete card.dataset.firstRow;
  });

  if (cards.length === 0) {
    return;
  }

  const cardTops = cards.map((card) => card.getBoundingClientRect().top + window.scrollY);
  const firstRowTop = Math.min(...cardTops);

  cards.forEach((card, index) => {
    if (cardTops[index] <= firstRowTop + 56) {
      card.dataset.firstRow = "true";
    }
  });
}

function keepCardsClearOfHeader() {
  const header = document.querySelector(".topbar");

  if (!header) {
    return;
  }

  const headerBounds = header.getBoundingClientRect();
  const headerRight = headerBounds.right + 10;
  const headerBottom = headerBounds.height + 10;

  document.querySelectorAll(".project-card").forEach((card) => {
    card.style.setProperty("--header-drop", "0px");

    if (card.dataset.firstRow !== "true") {
      return;
    }

    const viewportBounds = card.getBoundingClientRect();
    const cardBounds = {
      top: viewportBounds.top + window.scrollY,
      right: viewportBounds.right
    };
    const overlapsHeader =
      viewportBounds.left < headerRight &&
      cardBounds.right > headerBounds.left &&
      cardBounds.top < headerBottom;

    if (overlapsHeader) {
      card.style.setProperty("--header-drop", `${Math.ceil(headerBottom - cardBounds.top)}px`);
    }
  });
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
  markFirstRowCards();
  keepCardsClearOfHeader();
  scrollToReturnedImage();
}

window.addEventListener("pageshow", () => {
  scrollToReturnedImage();
});
