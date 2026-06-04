const viewer = document.querySelector("[data-viewer]");
const viewerImages = window.portfolioImages || [];

const imageGroups = [
  {
    range: ["001", "014"],
    title: "Omnipotent Youth Society/ tutor: Jessica Spresser/ Sem 1 2025/ University of Syd"
  },
  {
    range: ["015", "020"],
    title: "Precedent Study: House of Brazil (Le Corbusier) + Student Residence (Bruther+Baukunst)/ tutor: Jessica Spresser/ Sem 1 2025/ University of Syd"
  },
  {
    range: ["021", "044"],
    title: "the Continuous Line/ Collaborate with Coco Chen/ tutor: Jessica Spresser + Peter Besley/ Sem 2 2025/ University of Syd"
  },
  {
    range: ["045", "047"],
    title: "Super Transparent Shoe/ Collaborate with Coco Chen/ tutor: Jessica Spresser + Peter Besley/ Sem 2 2025/ University of Syd"
  },
  {
    range: ["048", "052"],
    title: "the Metropolitan Cockatoo Island Museum/ Collaborate with Coco Chen/ tutor: Catherine Lassen/ Sem 1 2026/ University of Syd"
  },
  {
    range: ["053", "055"],
    title: "Now Now Our Home Competition/ Collaborate with Toshio Ozaki/ Summer 2026"
  },
  {
    range: ["056", "065"],
    title: "House with a Thick Wall/ tutor: Andrea Ileris/Tri 1 2023/ University of NSW"
  },
  {
    range: ["066", "075"],
    title: "Cable temple/ tutor: Toshio Ozaki/Tri 2 2023 Graduation Project/ University of NSW"
  }
];

function numberValue(number) {
  return Number.parseInt(number, 10);
}

function getGroupInfo(selectedNumber) {
  const selectedValue = numberValue(selectedNumber);
  const group = imageGroups.find(({ range }) => {
    const [start, end] = range;
    return selectedValue >= numberValue(start) && selectedValue <= numberValue(end);
  });

  if (!group) {
    return { title: "", images: [] };
  }

  const [start, end] = group.range.map(numberValue);
  const images = viewerImages
    .filter((image) => {
      const value = numberValue(image.number);
      return value >= start && value <= end;
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

  figure.className = "viewer-item";
  number.className = "number";
  number.textContent = image.number;
  picture.src = image.src.trim();
  picture.alt = image.alt || "";
  picture.loading = index === 0 ? "eager" : "lazy";
  picture.decoding = "async";

  figure.append(number, picture);

  if (image.title) {
    const title = document.createElement("figcaption");
    title.className = "caption";
    title.textContent = image.title;
    figure.appendChild(title);
  }

  return figure;
}

if (viewer) {
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      if (document.referrer.endsWith("index.html") || document.referrer.endsWith("/")) {
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
}
