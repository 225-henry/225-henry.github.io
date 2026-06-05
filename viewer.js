const viewer = document.querySelector("[data-viewer]");
const viewerImages = window.portfolioImages || [];
const workLink = document.querySelector(".mark");

if (workLink) {
  workLink.addEventListener("click", (event) => {
    const cameFromHome = document.referrer.endsWith("index.html") || document.referrer.endsWith("/");

    if (cameFromHome) {
      event.preventDefault();
      window.history.back();
    }
  });
}

const imageGroups = [
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
    title: "House with a Very Very Thick Wall/ Tutor: Andrea Illeris/ Tri 1 2023/ University of NSW"
  },
  {
    range: ["066", "074"],
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

function numberValue(number) {
  return Number.parseInt(number, 10);
}

function randomBetween(min, max) {
  return min + Math.round(Math.random() * (max - min));
}

function getGroupInfo(selectedNumber) {
  const selectedValue = numberValue(selectedNumber);
  const group = imageGroups.find(({ range, ranges }) => {
    const groupRanges = ranges || [range];
    return groupRanges.some(([start, end]) => selectedValue >= numberValue(start) && selectedValue <= numberValue(end));
  });

  if (!group) {
    return { title: "", images: [] };
  }

  const groupRanges = group.ranges || [group.range];
  const images = viewerImages
    .filter((image) => {
      const value = numberValue(image.number);
      return groupRanges.some(([start, end]) => value >= numberValue(start) && value <= numberValue(end));
    })
    .sort((a, b) => numberValue(a.number) - numberValue(b.number));

  return { title: group.title, images };
}

function rotateFromSelected(group, selectedNumber) {
  const selectedIndex = group.findIndex((image) => image.number === selectedNumber);

  if (selectedIndex < 0) {
    return group;
  }

  return [...group.slice(selectedIndex), ...group.slice(0, selectedIndex)];
}

function createViewerImage(image, index) {
  const figure = document.createElement("figure");
  const number = document.createElement("figcaption");
  const picture = document.createElement("img");
  const alignment = ["start", "center", "end"][Math.floor(Math.random() * 3)];
  const width = index === 0 ? randomBetween(980, 1160) : randomBetween(760, 1080);
  const mobileWidth = index === 0 ? randomBetween(86, 96) : randomBetween(76, 94);
  const offset =
    alignment === "center"
      ? randomBetween(-24, 24)
      : alignment === "end"
        ? -randomBetween(0, 36)
        : randomBetween(0, 36);

  figure.className = "viewer-item is-loading";
  figure.style.setProperty("--viewer-width", `${width}px`);
  figure.style.setProperty("--viewer-mobile-width", `${mobileWidth}%`);
  figure.style.setProperty("--viewer-align", alignment);
  figure.style.setProperty("--viewer-offset", `${offset}px`);
  number.className = "number";
  number.textContent = image.number;
  picture.src = image.src.trim();
  picture.alt = image.alt || "";
  picture.loading = index === 0 ? "eager" : "lazy";
  picture.decoding = "async";
  picture.addEventListener("load", () => {
    figure.classList.remove("is-loading");
  }, { once: true });

  if (picture.complete) {
    figure.classList.remove("is-loading");
  }

  figure.append(number, picture);

  if (image.title) {
    const title = document.createElement("figcaption");
    title.className = "caption";
    title.textContent = image.title;
    figure.appendChild(title);
  }

  return figure;
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

if (viewer) {
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      const returnUrl = sessionStorage.getItem("viewer-return-url");

      if (returnUrl) {
        sessionStorage.removeItem("viewer-return-url");
        window.location.href = returnUrl;
        return;
      }

      const cameFromHome = document.referrer.endsWith("index.html") || document.referrer.endsWith("/");

      if (cameFromHome) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    }
  });

  const params = new URLSearchParams(window.location.search);
  const selectedNumber = params.get("image") || "001";
  const groupInfo = getGroupInfo(selectedNumber);
  const groupTitle = document.createElement("h1");
  const group = rotateFromSelected(groupInfo.images, selectedNumber);
  const fragment = document.createDocumentFragment();

  groupTitle.className = "viewer-title";
  groupTitle.textContent = groupInfo.title;
  fragment.appendChild(groupTitle);

  group.forEach((image, index) => {
    fragment.appendChild(createViewerImage(image, index));
  });

  viewer.appendChild(fragment);
  warmImageCache(group.slice(1));
}
