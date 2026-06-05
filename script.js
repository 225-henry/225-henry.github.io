const projectIndex = document.querySelector(".project-index");
const images = window.portfolioImages || [];
const imageMap = new Map(images.map((image) => [image.number, image]));
const layoutStorageKey = "home-layout-v31";
const returnImageKey = "home-return-image";
const returnScrollKey = "home-return-scroll";
const returnModeKey = "home-return-mode";
const hoverMarkerColors = ["#25abe2", "#e80415", "#fef900"];
const homeImageLimit = 60;
const homeImageGroups = [
  {
    range: ["001", "014"],
    title: "Omnipotent Youth Society/ Tutor: Jessica Spresser/ Sem 1 2025/ University of Sydney"
  },
  {
    range: ["015", "020"],
    title: "Precedent Study: House of Brazil (Le Corbusier) + Student Residence (Bruther + Baukunst)/ Tutor: Jessica Spresser/ Sem 1 2025/ University of Sydney"
  },
  {
    range: ["021", "044"],
    title: "The Continuous Line/ Collaborated with Coco Chen/ Tutor: Jessica Spresser + Peter Besley/ Sem 2 2025/ University of Sydney"
  },
  {
    range: ["045", "047"],
    title: "Super Transparent Shoe/ Collaborated with Coco Chen/ Tutor: Jessica Spresser + Peter Besley/ Sem 2 2025/ University of Sydney"
  },
  {
    range: ["048", "052"],
    title: "The Metropolitan Cockatoo Island Museum/ Collaborated with Coco Chen/ Tutor: Catherine Lassen/ Sem 1 2026/ University of Sydney"
  },
  {
    ranges: [["053", "055"], ["075", "078"]],
    title: "Now Now Our Home Competition/ Collaborated with Toshio Ozaki/ Summer 2026"
  },
  {
    range: ["056", "065"],
    max: 3,
    title: "House with a Very Very Thick Wall/ Tutor: Andrea Illeris/ Tri 1 2023/ University of NSW"
  },
  {
    range: ["066", "074"],
    max: 3,
    title: "Cable Temple/ Tutor: Toshio Ozaki/ Tri 2 2023 Graduation Project/ University of NSW"
  },
  {
    range: ["079", "082"],
    title: "Refurbishment of an Office Building in Sydney/ Under supervision of Toshio Ozaki at Ozaki Studio/ 2024"
  },
  {
    range: ["083", "085"],
    title: "A Terrace House Renovation in Sydney/ Under supervision of Toshio Ozaki at Ozaki Studio/ 2024"
  },
  {
    range: ["086", "087"],
    title: "A Family Home in Sydney's Northern Beaches/ Under supervision of Toshio Ozaki at Ozaki Studio/ 2024"
  }
];

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

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

function getGroupStart(group) {
  return (group.ranges || [group.range])[0][0];
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

function createLayoutItem(image, index, firstRowStyle, desktopFirstRowStyle) {
  const isGif = image.src.toLowerCase().includes(".gif");
  const sizeRoll = Math.random();
  const isOpeningImage = index < 4;
  const titleLength = image.title ? image.title.length : 0;
  const titleBoost = titleLength > 22 ? clamp((titleLength - 22) * 1.6, 0, 46) : 0;
  const phoneTitleBoost = titleLength > 18 ? clamp((titleLength - 18) * 0.35, 0, 8) : 0;
  const widthBase =
    isGif
      ? randomBetween(390, 470)
      : sizeRoll < 0.32
        ? randomBetween(210, 330)
        : sizeRoll < 0.74
          ? randomBetween(280, 390)
          : randomBetween(330, 395);
  const mobileWidthBase =
    isGif
      ? randomBetween(280, 325)
      : sizeRoll < 0.32
        ? randomBetween(210, 290)
        : sizeRoll < 0.74
          ? randomBetween(220, 305)
          : randomBetween(250, 300);
  const phoneWidthBase =
    isGif
      ? randomBetween(31, 35)
      : sizeRoll < 0.32
        ? randomBetween(24, 30)
        : sizeRoll < 0.74
          ? randomBetween(26, 30)
          : randomBetween(28, 32);
  const firstRowDesktopWidth =
    desktopFirstRowStyle === 1
      ? (index % 3 === 0 ? randomBetween(380, 480) : randomBetween(200, 310))
      : desktopFirstRowStyle === 3
        ? (index % 2 === 0 ? randomBetween(170, 230) : randomBetween(300, 380))
        : [randomBetween(180, 250), randomBetween(280, 360), randomBetween(340, 430), randomBetween(220, 310)][index % 4];
  const firstRowDesktopRight =
    desktopFirstRowStyle === 1
      ? randomBetween(80, 340)
      : desktopFirstRowStyle === 3
        ? randomBetween(10, 190)
        : randomBetween(35, 280);
  const firstRowDesktopLeft =
    desktopFirstRowStyle === 1
      ? randomBetween(0, 140)
      : desktopFirstRowStyle === 3
        ? randomBetween(0, 90)
        : randomBetween(0, 180);
  const width = isOpeningImage ? firstRowDesktopWidth : clamp(widthBase + titleBoost, 200, 390);
  const mobileWidth = clamp(mobileWidthBase + titleBoost * 0.25, 200, 310);
  const tabletWidth = clamp(Math.round(mobileWidth * 0.9), 180, 285);
  const openingPhoneWidths =
    firstRowStyle === 1
      ? [42, 28, 34, 25]
      : firstRowStyle === 3
        ? [24, 31, 25, 29]
        : [32, 25, 34, 27];
  const firstRowPhoneWidth = openingPhoneWidths[index % openingPhoneWidths.length] + randomBetween(-2, 2);
  const firstRowPhoneMax = isOpeningImage ? firstRowPhoneWidth + 2 : firstRowStyle === 1 ? 52 : firstRowStyle === 3 ? 29 : 36;
  const openingPhoneShift = [34, 48, 24, 42][index % 4];
  const phoneShift = isOpeningImage ? openingPhoneShift : index % 5 === 1 || index % 5 === 4 ? randomBetween(10, 24) : randomBetween(2, 10);
  const firstRowSpaceRight =
    firstRowStyle === 3
      ? randomBetween(4, 16)
      : firstRowStyle === 1
        ? randomBetween(5, 22)
        : randomBetween(4, 24);
  const firstRowSpaceLeft =
    firstRowStyle === 3
      ? randomBetween(0, 16)
      : firstRowStyle === 1
        ? randomBetween(0, 18)
        : randomBetween(0, 20);
  const phoneWidth = isOpeningImage ? firstRowPhoneWidth : clamp(phoneWidthBase + phoneTitleBoost * 0.6, 24, 38);
  const phoneMaxWidth = isOpeningImage ? firstRowPhoneMax : titleLength > 30 ? 39 : titleLength > 18 ? 37 : 35;

  return {
    type: "image",
    number: image.number,
    styles: {
      "--card-width": `${width}px`,
      "--mobile-card-width": `${mobileWidth}px`,
      "--tablet-card-width": `${tabletWidth}px`,
      "--phone-card-width": `${phoneWidth}%`,
      "--phone-card-max": `${phoneMaxWidth}%`,
      "--phone-space-top": `${isOpeningImage ? 5 : randomBetween(5, 46)}px`,
      "--phone-space-right": `${isOpeningImage ? firstRowSpaceRight : randomBetween(4, 18)}px`,
      "--phone-space-bottom": `${randomBetween(12, 48)}px`,
      "--phone-space-left": `${isOpeningImage ? firstRowSpaceLeft + phoneShift : randomBetween(4, 20) + phoneShift}px`,
      "--space-top": `${isOpeningImage ? 0 : randomBetween(30, 220)}px`,
      "--space-right": `${isOpeningImage ? firstRowDesktopRight : randomBetween(35, 215)}px`,
      "--space-bottom": `${randomBetween(45, 210)}px`,
      "--space-left": `${isOpeningImage ? firstRowDesktopLeft : randomBetween(0, 130)}px`,
      "--offset-x": `${randomBetween(0, 45)}px`,
      "--offset-y": `${randomBetween(0, 60)}px`,
      "--card-align": ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)],
      "--phone-card-align": isOpeningImage ? ["flex-start", "center", "flex-end", "center"][index % 4] : ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)],
      "--hover-marker-color": hoverMarkerColors[Math.floor(Math.random() * hoverMarkerColors.length)]
    }
  };
}

function createVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(260, 780)}px`,
      "--void-height": `${randomBetween(120, 360)}px`,
      "--void-margin": `${randomBetween(0, 140)}px ${randomBetween(0, 220)}px`
    }
  };
}

function createOpeningVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(160, 360)}px`,
      "--void-height": `${randomBetween(80, 210)}px`,
      "--void-margin": `${randomBetween(0, 36)}px ${randomBetween(18, 110)}px`
    }
  };
}

function createRandomLayout() {
  const shuffledImages = shuffleList(getBalancedHomeImages());
  const firstRowStyle = randomBetween(1, 3);
  const desktopFirstRowStyle = randomBetween(1, 3);
  const layout = [];

  shuffledImages.forEach((image, index) => {
    layout.push(createLayoutItem(image, index, firstRowStyle, desktopFirstRowStyle));

    if (index < 4 && Math.random() > 0.75) {
      layout.push(createOpeningVoidItem());
    }

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

function warmImageCache(imageList) {
  const preload = () => {
    imageList.forEach((image) => {
      const picture = new Image();
      picture.decoding = "async";
      picture.fetchPriority = "low";
      picture.src = image.src.trim();
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preload, { timeout: 1800 });
  } else {
    window.setTimeout(preload, 800);
  }
}

function renderLayout(layout) {
  let imageCount = 0;
  const fragment = document.createDocumentFragment();
  const renderedImages = [];

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
    renderedImages.push(image);
    applyStyles(card, item.styles);

    fragment.appendChild(card);
  });

  projectIndex.appendChild(fragment);
  warmImageCache(renderedImages.slice(3));
}

function restoreHomePosition() {
  const scrollPosition = sessionStorage.getItem(returnScrollKey);

  if (scrollPosition) {
    window.scrollTo(0, Number(scrollPosition));
    sessionStorage.removeItem(returnScrollKey);
    return;
  }

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
  const headerRight = headerBounds.right + 18;
  const headerBottom = headerBounds.height + 18;

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

function protectFirstRowFromHeader() {
  markFirstRowCards();
  keepCardsClearOfHeader();
}

function createWorkMenu() {
  const menu = document.querySelector("[data-work-menu]");
  const menuTrigger = document.querySelector("[data-work-count-menu]");

  if (!menu || !menuTrigger) {
    return;
  }

  const list = document.createElement("nav");
  list.className = "work-menu-list";

  homeImageGroups.forEach((group) => {
    const link = document.createElement("a");
    const dot = document.createElement("span");
    const title = document.createElement("span");

    dot.className = "work-menu-dot";
    dot.textContent = "●";
    title.textContent = group.title;
    link.href = `viewer.html?image=${encodeURIComponent(getGroupStart(group))}`;
    link.style.setProperty("--text-hover-color", hoverMarkerColors[Math.floor(Math.random() * hoverMarkerColors.length)]);
    link.append(dot, title);
    link.addEventListener("click", () => {
      sessionStorage.setItem(returnScrollKey, String(window.scrollY));
      sessionStorage.setItem(returnModeKey, "scroll");
      sessionStorage.removeItem(returnImageKey);
    });
    list.appendChild(link);
  });

  menu.appendChild(list);

  const closeMenu = () => {
    menu.classList.remove("is-open");
    menu.classList.add("is-closing");
    menu.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
      menu.classList.remove("is-closing");
    }, 160);
  };

  const openMenu = () => {
    menu.classList.remove("is-closing");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
  };

  menuTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (menu.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.addEventListener("click", (event) => {
    if (event.target === menu) {
      closeMenu();
    }
  });
}

createWorkMenu();

if (projectIndex) {
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  const isReload = navigationEntry?.type === "reload";
  const savedLayout = sessionStorage.getItem(layoutStorageKey);
  const layout = !isReload && savedLayout ? JSON.parse(savedLayout) : createRandomLayout();

  if (isReload) {
    sessionStorage.removeItem(returnImageKey);
    sessionStorage.removeItem(returnScrollKey);
    sessionStorage.removeItem(returnModeKey);
    window.scrollTo(0, 0);
  }

  projectIndex.addEventListener("click", (event) => {
    const card = event.target.closest(".project-card");

    if (card) {
      sessionStorage.setItem(returnImageKey, card.dataset.number);
    }
  });

  sessionStorage.setItem(layoutStorageKey, JSON.stringify(layout));
  renderLayout(layout);
  protectFirstRowFromHeader();
  restoreHomePosition();
}

window.addEventListener("pageshow", () => {
  restoreHomePosition();
});
