const projectIndex = document.querySelector(".project-index");
const images = window.portfolioImages || [];
const imageMap = new Map(images.map((image) => [image.number, image]));
const layoutStorageKey = "home-layout-v120";
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
    title: "House of Brazil (Le Corbusier) + Student Residence (Bruther + Baukunst)/ Tutor: Jessica Spresser/ Sem 1 2025/ University of Sydney"
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
    ranges: [["048", "052"], ["088", "089"]],
    title: "The Metropolitan Cockatoo Island Museum/ Collaborated with Coco Chen/ Tutor: Catherine Lassen/ Sem 1 2026/ University of Sydney"
  },
  {
    ranges: [["053", "055"], ["075", "078"]],
    title: "Now Now Our Home Competition/ Collaborated with Toshio Ozaki/ Summer 2026"
  },
  {
    range: ["056", "065"],
    max: 5,
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
    [44, 41, 40, 46, 56, 42, 41, 45, 39, 58, 41, 44, 40, 43, 54, 46, 39],
    [41, 45, 43, 39, 57, 42, 44, 40, 43, 55, 46, 39, 43, 41, 58, 42, 41],
    [46, 39, 42, 43, 56, 40, 44, 42, 41, 58, 39, 45, 41, 43, 54, 40, 46],
    [43, 41, 45, 39, 58, 43, 42, 40, 46, 56, 41, 44, 39, 43, 57, 45, 40]
  ];
  const phonePattern = phonePatterns[firstRowStyle % phonePatterns.length];
  const phoneLayoutMode = index % phonePattern.length;
  const phoneWidthPattern = phonePattern;
  const patternedPhoneWidth = phoneWidthPattern[phoneLayoutMode] + randomBetween(-2, 2);
  const phoneWidthBase =
    isGif
      ? randomBetween(34, 40)
      : patternedPhoneWidth;
  const firstRowDesktopWidth =
    desktopFirstRowStyle === 1
      ? (index % 3 === 0 ? randomBetween(300, 340) : randomBetween(260, 295))
      : desktopFirstRowStyle === 3
        ? (index % 2 === 0 ? randomBetween(255, 285) : randomBetween(280, 315))
        : [randomBetween(265, 290), randomBetween(280, 310), randomBetween(310, 340), randomBetween(275, 305)][index % 4];
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
  const widthPattern = [285, 305, 325, 295, 315, 275];
  const steadyWidth = widthPattern[index % widthPattern.length] + randomBetween(-8, 8);
  const desktopSpaceTopPattern = [42, 58, 50, 70, 46, 62, 54, 66];
  const desktopSpaceRightPattern = [54, 72, 64, 82, 58, 76, 68, 86];
  const desktopSpaceBottomPattern = [68, 84, 76, 92, 72, 88, 80, 96];
  const desktopSpaceLeftPattern = [36, 54, 44, 62, 40, 58, 48, 66];
  const desktopOffsetXPattern = [0, 6, -4, 8, -2, 5, 0, 7];
  const desktopOffsetYPattern = [0, 4, 2, 6, 0, 5, 3, 7];
  const width = isOpeningImage ? firstRowDesktopWidth : clamp(steadyWidth, 275, 335);
  const mobileWidth = clamp(mobileWidthBase, 190, 285);
  const tabletWidth = clamp(Math.round(mobileWidth * 0.9), 170, 260);
  const openingPhoneWidths =
    firstRowStyle === 1
      ? [44, 41, 43, 40]
      : firstRowStyle === 3
        ? [40, 44, 41, 43]
        : [43, 40, 45, 41];
  const firstRowPhoneWidth = openingPhoneWidths[index % openingPhoneWidths.length] + randomBetween(0, 2);
  const firstRowPhoneMax = isOpeningImage ? firstRowPhoneWidth + 2 : firstRowStyle === 1 ? 46 : firstRowStyle === 3 ? 40 : 44;
  const openingPhoneShift = [8, 14, 5, 12][index % 4];
  const phoneShift = isOpeningImage ? openingPhoneShift : index % 5 === 1 || index % 5 === 4 ? randomBetween(3, 9) : randomBetween(0, 5);
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
    [1, 5, 2, 4, 7, 1, 4, 2, 5, 1],
    [6, 1, 4, 2, 7, 3, 1, 5, 2, 4],
    [2, 7, 1, 5, 3, 6, 1, 4, 7, 2],
    [4, 2, 8, 1, 5, 2, 6, 1, 3, 5]
  ];
  const phoneSideShiftPattern = isOpeningImage
    ? [2, 4, 1, 5]
    : phoneSideShiftPatterns[firstRowStyle % phoneSideShiftPatterns.length];
  const phoneSideShift = phoneSideShiftPattern[index % phoneSideShiftPattern.length];
  const phoneRightPatterns = [
    [4, 7, 2, 5, 8, 1, 6, 3, 7, 2],
    [8, 2, 5, 3, 9, 1, 4, 6, 3, 7],
    [3, 9, 1, 6, 4, 8, 2, 5, 7, 3],
    [6, 3, 8, 1, 5, 7, 2, 6, 4, 8]
  ];
  const phoneRightPattern = isOpeningImage
    ? [4, 2, 5, 3]
    : phoneRightPatterns[firstRowStyle % phoneRightPatterns.length];
  const phoneRightSpace = phoneRightPattern[index % phoneRightPattern.length] + randomBetween(-2, 2);
  const phoneLeftSpace =
    (isOpeningImage ? Math.round(firstRowSpaceLeft * 0.35) + phoneShift + phoneSideShift : phoneSideShift + phoneShift) +
    randomBetween(0, 3);
  const previousPhoneWidth = phoneWidthPattern[(phoneLayoutMode + phoneWidthPattern.length - 1) % phoneWidthPattern.length];
  const nextPhoneWidth = phoneWidthPattern[(phoneLayoutMode + 1) % phoneWidthPattern.length];
  const isNearPhoneSingle = previousPhoneWidth >= 48 || nextPhoneWidth >= 48;
  const phoneWidth = isOpeningImage ? firstRowPhoneWidth : clamp(phoneWidthBase + randomBetween(-1, 1), 39, 59);
  const isPhoneSingleWidth = phoneWidth >= 48;
  const phoneMaxWidth = isOpeningImage ? Math.min(firstRowPhoneMax + 4, 48) : isPhoneSingleWidth ? 59 : isNearPhoneSingle || phoneWidth <= 40 ? 44 : 48;
  const phoneOffsetPatterns = [
    [-4, 8, 1, 10, -3, 5, 12, 2, 8, -5, 6, 10],
    [9, -4, 11, 3, 7, -1, 10, -3, 5, 12, 2, 8],
    [1, 10, -4, 6, 12, 3, 8, -2, 11, 4, -1, 9],
    [11, 2, 7, -5, 9, 1, 12, 5, -2, 10, 3, 6]
  ];
  const phoneVerticalOffsetPatterns = [
    [-32, 46, 12, 68, -18, 34, 76, 8, 54, -26, 28, 62],
    [58, -24, 42, 10, 72, -14, 30, 80, 5, 48, -30, 64],
    [14, 70, -28, 38, 84, 6, 52, -18, 66, 24, -34, 44],
    [78, 18, -24, 56, 8, 40, -16, 82, 26, 68, -30, 36]
  ];
  const phoneTopStaggerPatterns = [
    [0, 38, 8, 54, 16, 44, 4, 62],
    [42, 6, 50, 14, 34, 58, 10, 46],
    [12, 56, 4, 40, 64, 18, 48, 8],
    [52, 16, 36, 60, 6, 44, 20, 54]
  ];
  const phoneBottomStaggerPatterns = [
    [18, 4, 24, 8, 14, 28, 6, 20],
    [6, 22, 10, 26, 4, 18, 30, 12],
    [24, 8, 16, 32, 10, 20, 6, 28],
    [12, 30, 6, 22, 16, 4, 26, 10]
  ];
  const phoneOffsetPattern = phoneOffsetPatterns[firstRowStyle % phoneOffsetPatterns.length];
  const phoneVerticalOffsetPattern = phoneVerticalOffsetPatterns[firstRowStyle % phoneVerticalOffsetPatterns.length];
  const phoneTopStaggerPattern = phoneTopStaggerPatterns[firstRowStyle % phoneTopStaggerPatterns.length];
  const phoneBottomStaggerPattern = phoneBottomStaggerPatterns[firstRowStyle % phoneBottomStaggerPatterns.length];
  const isPhoneRightColumn = index % 2 === 1;
  const isFirstPhoneRightColumn = index === 1;
  const phoneOffsetX = isOpeningImage
    ? [0, 7, -3, 10][index % 4] + randomBetween(-2, 2)
    : phoneOffsetPattern[index % phoneOffsetPattern.length] + randomBetween(-2, 2);
  const phoneOffsetY = isFirstPhoneRightColumn
    ? 0
    : isOpeningImage
    ? [0, 34, 10, 52][index % 4] + randomBetween(-4, 5)
    : phoneVerticalOffsetPattern[index % phoneVerticalOffsetPattern.length] + randomBetween(-8, 8);
  const phoneRightColumnLift = isPhoneRightColumn ? (isFirstPhoneRightColumn ? 0 : randomBetween(24, 46)) : 0;
  const phoneTopStagger = isOpeningImage
    ? [0, 18, 4, 28][index % 4]
    : phoneTopStaggerPattern[index % phoneTopStaggerPattern.length];
  const phoneBottomStagger = isOpeningImage
    ? [10, 2, 16, 4][index % 4]
    : phoneBottomStaggerPattern[index % phoneBottomStaggerPattern.length];
  const phoneAlign = isFirstPhoneRightColumn ? "end" : ["start", "center", "end", "center", "start"][index % 5];
  const phoneColumnWidth = isPhoneSingleWidth
    ? randomBetween(78, 86)
    : clamp(Math.round(phoneWidth * 1.62) + randomBetween(-4, 6), 74, 86);
  const maxPhoneColumnShift = Math.max(0, 96 - phoneColumnWidth);
  const phoneColumnShiftOptions = [
    0,
    Math.round(maxPhoneColumnShift * 0.45),
    Math.round(maxPhoneColumnShift * 0.9),
    randomBetween(0, maxPhoneColumnShift),
    Math.round(maxPhoneColumnShift * 0.2)
  ];
  const phoneColumnShift = isFirstPhoneRightColumn
    ? "0%"
    : `${phoneColumnShiftOptions[index % phoneColumnShiftOptions.length]}%`;
  const openingPhoneTopBase = index === 1 ? 0 : 18;
  const phoneTopSpaceBase = isOpeningImage
    ? openingPhoneTopBase
    : isPhoneSingleWidth || isNearPhoneSingle
      ? randomBetween(34, 56)
      : randomBetween(30, 50);
  const phoneTopSpace = isFirstPhoneRightColumn
    ? 0
    : Math.max(0, phoneTopSpaceBase + phoneTopStagger - phoneRightColumnLift);

  return {
    type: "image",
    number: image.number,
    styles: {
      "--card-width": `${width}px`,
      "--mobile-card-width": `${mobileWidth}px`,
      "--tablet-card-width": `${tabletWidth}px`,
      "--phone-card-width": `${phoneWidth}%`,
      "--phone-card-max": `${phoneMaxWidth}%`,
      "--phone-space-top": `${phoneTopSpace}px`,
      "--phone-space-right": `${Math.max(2, phoneRightSpace - 2)}px`,
      "--phone-space-bottom": `${(isPhoneSingleWidth || isNearPhoneSingle ? randomBetween(48, 78) : randomBetween(42, 68)) + phoneBottomStagger}px`,
      "--phone-space-left": `${Math.max(2, phoneLeftSpace - 3)}px`,
      "--phone-offset-x": `${phoneOffsetX}px`,
      "--phone-offset-y": `${phoneOffsetY - phoneRightColumnLift}px`,
      "--phone-card-align": phoneAlign,
      "--phone-column-width": `${phoneColumnWidth}%`,
      "--phone-column-shift": phoneColumnShift,
      "--space-top": `${index === 0 ? 58 : isOpeningImage ? 10 : desktopSpaceTopPattern[index % desktopSpaceTopPattern.length] + randomBetween(-6, 6)}px`,
      "--space-right": `${isOpeningImage ? clamp(firstRowDesktopRight, 48, 92) : desktopSpaceRightPattern[index % desktopSpaceRightPattern.length] + randomBetween(-6, 6)}px`,
      "--space-bottom": `${desktopSpaceBottomPattern[index % desktopSpaceBottomPattern.length] + randomBetween(-8, 8)}px`,
      "--space-left": `${index === 0 ? Math.max(firstRowDesktopLeft, 160) : isOpeningImage ? clamp(firstRowDesktopLeft, 28, 72) : desktopSpaceLeftPattern[index % desktopSpaceLeftPattern.length] + randomBetween(-6, 6)}px`,
      "--offset-x": `${desktopOffsetXPattern[index % desktopOffsetXPattern.length] + randomBetween(-2, 2)}px`,
      "--offset-y": `${desktopOffsetYPattern[index % desktopOffsetYPattern.length] + randomBetween(-2, 2)}px`,
      "--card-align": ["flex-start", "center", "flex-end", "center"][index % 4],
      "--hover-marker-color": hoverMarkerColors[Math.floor(Math.random() * hoverMarkerColors.length)]
    }
  };
}

function createVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(500, 780)}px`,
      "--void-height": `${randomBetween(165, 285)}px`,
      "--void-margin": `${randomBetween(28, 60)}px ${randomBetween(110, 200)}px`,
      "--phone-void-width": `${randomBetween(8, 20)}%`,
      "--phone-void-height": `${randomBetween(3, 10)}px`,
      "--phone-void-margin": `${randomBetween(1, 3)}px 0 ${randomBetween(1, 4)}px ${randomBetween(0, 3)}%`
    }
  };
}

function createSmallVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(360, 560)}px`,
      "--void-height": `${randomBetween(125, 220)}px`,
      "--void-margin": `${randomBetween(24, 50)}px ${randomBetween(78, 150)}px`,
      "--phone-void-width": `${randomBetween(6, 16)}%`,
      "--phone-void-height": `${randomBetween(2, 8)}px`,
      "--phone-void-margin": `${randomBetween(1, 2)}px 0 ${randomBetween(1, 3)}px ${randomBetween(0, 4)}%`
    }
  };
}

function createWideVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(720, 1100)}px`,
      "--void-height": `${randomBetween(180, 320)}px`,
      "--void-margin": `${randomBetween(34, 68)}px ${randomBetween(140, 260)}px`,
      "--phone-void-width": `${randomBetween(10, 22)}%`,
      "--phone-void-height": `${randomBetween(4, 12)}px`,
      "--phone-void-margin": `${randomBetween(1, 3)}px 0 ${randomBetween(2, 5)}px ${randomBetween(0, 3)}%`
    }
  };
}

function createOpeningVoidItem() {
  return {
    type: "void",
    styles: {
      "--void-width": `${randomBetween(480, 740)}px`,
      "--void-height": `${randomBetween(145, 260)}px`,
      "--void-margin": `${randomBetween(28, 58)}px ${randomBetween(100, 190)}px`,
      "--phone-void-width": `${randomBetween(7, 18)}%`,
      "--phone-void-height": `${randomBetween(3, 9)}px`,
      "--phone-void-margin": `${randomBetween(1, 3)}px 0 ${randomBetween(1, 4)}px ${randomBetween(0, 4)}%`
    }
  };
}

function createRandomLayout() {
  const shuffledImages = shuffleList(getBalancedHomeImages());
  const firstRowStyle = randomBetween(1, 3);
  const desktopFirstRowStyle = randomBetween(1, 3);
  const layout = [];
  const voidMakers = [createSmallVoidItem, createVoidItem, createWideVoidItem];
  const earlyVoidIndex = randomBetween(1, 4);
  const voidSlots = new Map();
  let segmentStart = randomBetween(2, 3);

  while (segmentStart < shuffledImages.length) {
    const segmentEnd = Math.min(shuffledImages.length - 1, segmentStart + randomBetween(1, 2));
    let candidate = randomBetween(segmentStart, segmentEnd);

    if (candidate === earlyVoidIndex) {
      candidate = Math.min(shuffledImages.length - 1, candidate + 1);
    }

    if (candidate !== earlyVoidIndex) {
      voidSlots.set(candidate, {
        position: Math.random() < 0.75 ? "before" : "after",
        maker: voidMakers[randomBetween(0, voidMakers.length - 1)]
      });
    }

    segmentStart = candidate + randomBetween(3, 4);
  }

  shuffledImages.forEach((image, index) => {
    const voidSlot = voidSlots.get(index);

    if (voidSlot?.position === "before") {
      layout.push(voidSlot.maker());
    }

    layout.push(createLayoutItem(image, index, firstRowStyle, desktopFirstRowStyle));

    if (index === earlyVoidIndex) {
      layout.push(createOpeningVoidItem());
    }

    if (voidSlot?.position === "after") {
      layout.push(voidSlot.maker());
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
  const priorityPictures = [];

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
    if (imageCount < 2) {
      const picture = card.querySelector("img");
      if (picture) {
        priorityPictures.push(picture);
      }
    }
    imageCount += 1;
    renderedImages.push(image);
    applyStyles(card, item.styles);

    fragment.appendChild(card);
  });

  projectIndex.appendChild(fragment);
  warmImageCache(renderedImages.slice(3, 9));
  return priorityPictures;
}

function settlePhoneHomeLayout(pictures) {
  if (!window.matchMedia("(max-width: 560px)").matches) {
    document.documentElement.classList.remove("is-phone-home-preparing");
    return;
  }

  const waitForPicture = (picture) => {
    if (picture.complete && picture.naturalWidth > 0) {
      return Promise.resolve();
    }

    if (typeof picture.decode === "function") {
      return picture.decode().catch(() => undefined);
    }

    return new Promise((resolve) => {
      picture.addEventListener("load", resolve, { once: true });
      picture.addEventListener("error", resolve, { once: true });
    });
  };

  const reveal = () => {
    protectFirstRowFromHeader();
    document.documentElement.classList.remove("is-phone-home-preparing");
  };

  Promise.race([
    Promise.all(pictures.map(waitForPicture)),
    new Promise((resolve) => window.setTimeout(resolve, 900))
  ]).then(() => {
    window.requestAnimationFrame(reveal);
  });
}

function restoreHomePosition() {
  const scrollPosition = returnScrollFromUrl ?? sessionStorage.getItem(returnScrollKey);

  if (scrollPosition) {
    const targetScroll = Number(scrollPosition);

    window.scrollTo(0, targetScroll);
    window.requestAnimationFrame(() => window.scrollTo(0, targetScroll));
    window.setTimeout(() => window.scrollTo(0, targetScroll), 120);
    window.setTimeout(() => window.scrollTo(0, targetScroll), 360);
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

  if (window.matchMedia("(max-width: 560px)").matches) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.style.setProperty("--header-drop", "0px");
    });
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
    dot.textContent = "\u25cf";
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
      menu.classList.remove("is-open", "is-closing");
      menu.setAttribute("aria-hidden", "true");
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
  if (window.matchMedia("(max-width: 560px)").matches) {
    document.documentElement.classList.add("is-phone-home-preparing");
  }

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
  const priorityPictures = renderLayout(layout);
  if (window.matchMedia("(max-width: 560px)").matches) {
    settlePhoneHomeLayout(priorityPictures);
  } else {
    protectFirstRowFromHeader();
  }
  restoreHomePosition();

  if (returnScrollFromUrl) {
    window.requestAnimationFrame(() => window.scrollTo(0, Number(returnScrollFromUrl)));
    window.setTimeout(() => window.scrollTo(0, Number(returnScrollFromUrl)), 80);
  }
}

if (projectIndex) {
  window.addEventListener("pageshow", () => {
    if (returnScrollFromUrl) {
      window.scrollTo(0, Number(returnScrollFromUrl));
    } else {
      restoreHomePosition();
    }
  });
}
