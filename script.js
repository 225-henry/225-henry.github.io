const projectIndex = document.querySelector(".project-index");
const images = window.portfolioImages || [];
const imageMap = new Map(images.map((image) => [image.number, image]));
const layoutStorageKey = "home-layout-v72";
const returnImageKey = "home-return-image";
const returnScrollKey = "home-return-scroll";
const hoverMarkerColors = ["#25abe2", "#e80415", "#fef900"];
const homeImageLimit = 50;
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

Object.keys(sessionStorage)
  .filter((key) => key.startsWith("home-layout-") && key !== layoutStorageKey)
  .forEach((key) => sessionStorage.removeItem(key));

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const pageParams = new URLSearchParams(window.location.search);
const returnScrollFromUrl = pageParams.get("scroll");

if (pageParams.has("refresh") || pageParams.has("return")) {
  window.history.replaceState(null, "", window.location.pathname);
}

document.querySelector(".nav a[href='info.html']")?.addEventListener("click", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (currentPage === "index.html") {
    sessionStorage.setItem(returnScrollKey, String(window.scrollY));
  }
});

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
  picture.addEventListener("load", () => {
    card.classList.remove("is-loading");
  }, { once: true });

  if (!picture.complete) {
    card.classList.add("is-loading");
  }

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
  const widthBase =
    isGif
      ? randomBetween(330, 400)
      : sizeRoll < 0.32
        ? randomBetween(275, 320)
        : sizeRoll < 0.74
          ? randomBetween(250, 335)
          : randomBetween(285, 355);
  const mobileWidthBase =
    isGif
      ? randomBetween(260, 300)
      : sizeRoll < 0.32
        ? randomBetween(200, 270)
        : sizeRoll < 0.74
          ? randomBetween(210, 285)
          : randomBetween(235, 280);
  const phonePatterns = [
    [39, 25, 26, 32, 33, 28, 31, 38, 25, 27, 33, 29],
    [31, 33, 25, 39, 26, 28, 34, 31, 27, 38, 25, 29],
    [26, 29, 39, 25, 31, 33, 26, 29, 34, 32, 25, 30],
    [34, 25, 39, 26, 29, 32, 31, 38, 25, 27, 33, 30]
  ];
  const phonePattern = phonePatterns[firstRowStyle % phonePatterns.length];
  const phoneLayoutMode = index % phonePattern.length;
  const phoneWidthPattern = phonePattern;
  const patternedPhoneWidth = phoneWidthPattern[phoneLayoutMode] + randomBetween(-2, 2);
  const phoneWidthBase =
    isGif
      ? randomBetween(36, 42)
      : patternedPhoneWidth;
  const firstRowDesktopWidth =
    desktopFirstRowStyle === 1
      ? (index % 3 === 0 ? randomBetween(310, 390) : randomBetween(250, 300))
      : desktopFirstRowStyle === 3
        ? (index % 2 === 0 ? randomBetween(245, 280) : randomBetween(265, 330))
        : [randomBetween(245, 285), randomBetween(260, 315), randomBetween(300, 365), randomBetween(260, 305)][index % 4];
  const firstRowDesktopRight =
    desktopFirstRowStyle === 1
      ? randomBetween(42, 180)
      : desktopFirstRowStyle === 3
        ? randomBetween(8, 120)
        : randomBetween(24, 160);
  const firstRowDesktopLeft =
    desktopFirstRowStyle === 1
      ? randomBetween(0, 78)
      : desktopFirstRowStyle === 3
        ? randomBetween(0, 52)
        : randomBetween(0, 92);
  const width = isOpeningImage ? firstRowDesktopWidth : clamp(widthBase, 265, 355);
  const mobileWidth = clamp(mobileWidthBase, 190, 285);
  const tabletWidth = clamp(Math.round(mobileWidth * 0.9), 170, 260);
  const openingPhoneWidths =
    firstRowStyle === 1
      ? [35, 30, 33, 28]
      : firstRowStyle === 3
        ? [27, 32, 29, 31]
        : [33, 29, 35, 30];
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
  const phoneSideShiftPatterns = [
    [2, 16, 5, 11, 20, 4, 12, 7, 15, 3],
    [18, 4, 12, 6, 22, 8, 3, 16, 5, 14],
    [6, 20, 3, 15, 8, 18, 4, 12, 22, 5],
    [12, 5, 24, 4, 16, 7, 20, 3, 10, 18]
  ];
  const phoneSideShiftPattern = isOpeningImage
    ? [8, 12, 5, 14]
    : phoneSideShiftPatterns[firstRowStyle % phoneSideShiftPatterns.length];
  const phoneSideShift = phoneSideShiftPattern[index % phoneSideShiftPattern.length];
  const phoneRightPatterns = [
    [8, 14, 5, 10, 16, 4, 12, 6, 15, 5],
    [16, 5, 11, 7, 18, 4, 9, 13, 6, 15],
    [6, 18, 4, 12, 8, 16, 5, 10, 14, 7],
    [13, 6, 17, 4, 10, 15, 5, 12, 8, 16]
  ];
  const phoneRightPattern = isOpeningImage
    ? [10, 5, 12, 6]
    : phoneRightPatterns[firstRowStyle % phoneRightPatterns.length];
  const phoneRightSpace = phoneRightPattern[index % phoneRightPattern.length] + randomBetween(-2, 2);
  const phoneLeftSpace =
    (isOpeningImage ? firstRowSpaceLeft + phoneShift + phoneSideShift - 8 : phoneSideShift + Math.max(0, phoneShift - 8)) +
    randomBetween(2, 8);
  const previousPhoneWidth = phoneWidthPattern[(phoneLayoutMode + phoneWidthPattern.length - 1) % phoneWidthPattern.length];
  const nextPhoneWidth = phoneWidthPattern[(phoneLayoutMode + 1) % phoneWidthPattern.length];
  const isNearPhoneSingle = previousPhoneWidth >= 38 || nextPhoneWidth >= 38;
  const phoneWidth = isOpeningImage ? firstRowPhoneWidth : clamp(phoneWidthBase, 25, 39);
  const isPhoneSingleWidth = phoneWidth >= 38;
  const phoneMaxWidth = isOpeningImage ? Math.min(firstRowPhoneMax, 35) : isPhoneSingleWidth ? 39 : isNearPhoneSingle || phoneWidth <= 29 ? 29 : 35;

  return {
    type: "image",
    number: image.number,
    styles: {
      "--card-width": `${width}px`,
      "--mobile-card-width": `${mobileWidth}px`,
      "--tablet-card-width": `${tabletWidth}px`,
      "--phone-card-width": `${phoneWidth}%`,
      "--phone-card-max": `${phoneMaxWidth}%`,
      "--phone-space-top": `${isOpeningImage ? 4 : isPhoneSingleWidth || isNearPhoneSingle ? randomBetween(2, 6) : randomBetween(4, 10)}px`,
      "--phone-space-right": `${Math.max(2, phoneRightSpace - 2)}px`,
      "--phone-space-bottom": `${isPhoneSingleWidth || isNearPhoneSingle ? randomBetween(3, 8) : randomBetween(5, 12)}px`,
      "--phone-space-left": `${Math.max(2, phoneLeftSpace - 3)}px`,
      "--space-top": `${index === 0 ? 58 : isOpeningImage ? 0 : randomBetween(24, 72)}px`,
      "--space-right": `${isOpeningImage ? Math.max(firstRowDesktopRight, 44) : randomBetween(34, 78)}px`,
      "--space-bottom": `${randomBetween(38, 88)}px`,
      "--space-left": `${index === 0 ? Math.max(firstRowDesktopLeft, 180) : isOpeningImage ? Math.max(firstRowDesktopLeft, 18) : randomBetween(14, 46)}px`,
      "--offset-x": `${randomBetween(0, 10)}px`,
      "--offset-y": `${randomBetween(0, 16)}px`,
      "--card-align": ["flex-start", "center", "center", "flex-end"][index % 4],
      "--phone-card-align": isOpeningImage ? ["flex-start", "center", "flex-end", "center"][index % 4] : ["flex-start", "center", "flex-end"][Math.floor(Math.random() * 3)],
      "--hover-marker-color": hoverMarkerColors[Math.floor(Math.random() * hoverMarkerColors.length)]
    }
  };
}

function createVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(300, 520)}px`,
      "--void-height": `${randomBetween(180, 340)}px`,
      "--void-margin": `${randomBetween(30, 108)}px ${randomBetween(56, 140)}px`
    }
  };
}

function createOpeningVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(240, 400)}px`,
      "--void-height": `${randomBetween(150, 270)}px`,
      "--void-margin": `${randomBetween(24, 84)}px ${randomBetween(46, 116)}px`
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

    if (index < 4 && index === 2) {
      layout.push(createOpeningVoidItem());
    }

    if (index > 0 && (index % 3 === 0 || Math.random() > 0.88)) {
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
  warmImageCache(renderedImages.slice(3, 15));
}

function restoreHomePosition() {
  const scrollPosition = returnScrollFromUrl ?? sessionStorage.getItem(returnScrollKey);

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
      const currentPage = window.location.pathname.split("/").pop() || "index.html";
      const currentScroll = String(window.scrollY);

      if (currentPage === "index.html") {
        sessionStorage.setItem("viewer-return-url", `index.html?return=${Date.now()}&scroll=${encodeURIComponent(currentScroll)}`);
      } else {
        sessionStorage.setItem("viewer-return-url", `${currentPage}${window.location.search}${window.location.hash}`);
      }

      sessionStorage.setItem(returnScrollKey, currentScroll);
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

  if (returnScrollFromUrl) {
    window.requestAnimationFrame(() => window.scrollTo(0, Number(returnScrollFromUrl)));
    window.setTimeout(() => window.scrollTo(0, Number(returnScrollFromUrl)), 80);
  }
}

window.addEventListener("pageshow", () => {
  if (returnScrollFromUrl) {
    window.scrollTo(0, Number(returnScrollFromUrl));
  } else {
    restoreHomePosition();
  }
});
