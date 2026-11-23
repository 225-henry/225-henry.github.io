window.portfolioGroups = [
  {
    slug: "omnipotent-youth-society",
    range: ["001", "014"],
    title: "Omnipotent Youth Society/ Tutor: Jessica Spresser/ Sem 1 2025/ University of Sydney"
  },
  {
    slug: "house-of-brazil-student-residence",
    range: ["015", "020"],
    title: "House of Brazil (Le Corbusier) + Student Residence (Bruther + Baukunst)/ Tutor: Jessica Spresser/ Sem 1 2025/ University of Sydney"
  },
  {
    slug: "the-continuous-line",
    range: ["021", "044"],
    title: "The Continuous Line/ Collaborated with Coco Chen/ Tutor: Jessica Spresser + Peter Besley/ Sem 2 2025/ University of Sydney"
  },
  {
    slug: "super-transparent-shoe",
    range: ["045", "047"],
    title: "Super Transparent Shoe/ Collaborated with Coco Chen/ Tutor: Jessica Spresser + Peter Besley/ Sem 2 2025/ University of Sydney"
  },
  {
    slug: "cockatoo-island-museum",
    ranges: [["048", "052"], ["088", "089"]],
    title: "The Metropolitan Cockatoo Island Museum/ Collaborated with Coco Chen/ Tutor: Catherine Lassen/ Sem 1 2026/ University of Sydney"
  },
  {
    slug: "comp-now-now-our-home",
    ranges: [["053", "055"], ["075", "078"]],
    title: "Comp NOW NOW: Our Home/ Collaborated with Toshio Ozaki/ Summer 2026"
  },
  {
    slug: "house-with-a-very-very-thick-wall",
    range: ["056", "065"],
    max: 5,
    title: "House with a Very Very Thick Wall/ Tutor: Andrea Illeris/ Tri 1 2023/ University of NSW"
  },
  {
    slug: "cable-temple",
    range: ["066", "074"],
    max: 3,
    title: "Cable Temple/ Tutor: Toshio Ozaki/ Tri 2 2023 Graduation Project/ University of NSW"
  },
  {
    slug: "office-building-refurbishment-sydney",
    range: ["079", "082"],
    title: "Refurbishment of an Office Building in Sydney/ Under supervision of Toshio Ozaki at Ozaki Studio/ 2024"
  },
  {
    slug: "terrace-house-renovation-sydney",
    range: ["083", "085"],
    title: "A Terrace House Renovation in Sydney/ Under supervision of Toshio Ozaki at Ozaki Studio/ 2024"
  },
  {
    slug: "family-home-northern-beaches",
    range: ["086", "087"],
    title: "A Family Home in Sydney's Northern Beaches/ Under supervision of Toshio Ozaki at Ozaki Studio/ 2024"
  },
  {
    slug: "a-cliche-love-story",
    range: ["090", "094"],
    homeMin: 5,
    title: "A Cliche Love Story/ Thesis Studio/ Sem 2 2026/ University of Sydney"
  }
];

function findProjectForImage(number) {
  const value = Number(number);
  return window.portfolioGroups.find((group) => (group.ranges || [group.range])
    .some(([start, end]) => value >= Number(start) && value <= Number(end)));
}

function projectViewerUrl(group) {
  return "viewer.html?project=" + encodeURIComponent(group.slug);
}

function projectDateOrder(text) {
  const years = text.match(/\b(?:19|20)\d{2}\b/g);
  const year = years ? Number(years[years.length - 1]) : 0;
  const term = text.match(/\b(?:Sem|Tri)\s+(\d)\b/i);
  return year * 10 + (term ? Number(term[1]) : /\bWinter\b/i.test(text) ? 2 : 1);
}

function createFactCatalog() {
  document.querySelectorAll("[data-catalog-list]").forEach((list) => {
    const existingContent = list.firstChild;
    const groups = list.dataset.catalogGroups
      ? list.dataset.catalogGroups.split(",").map((index) => window.portfolioGroups[Number(index)])
      : window.portfolioGroups;
    groups.forEach((group) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = projectViewerUrl(group);
      link.textContent = group.title.replace(/\/ University of (?:Sydney|NSW)$/, "");
      link.style.setProperty("--text-hover-color", faviconColors[Math.floor(Math.random() * faviconColors.length)]);
      item.appendChild(link);
      list.insertBefore(item, existingContent);
    });
    [...list.children]
      .sort((a, b) => projectDateOrder(b.textContent) - projectDateOrder(a.textContent))
      .forEach((item) => list.appendChild(item));
    list.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      sessionStorage.setItem("viewer-return-url", "info.html#" + (list.id || "catalog"));
    });
  });
}

createFactCatalog();
