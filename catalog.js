window.portfolioGroups = [
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

function createWorkMenu() {
  const menu = document.querySelector("[data-work-menu]");
  const trigger = document.querySelector("[data-work-count-menu]");
  if (!menu || !trigger) return;

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    menu.setAttribute("aria-hidden", String(!open));
    trigger.setAttribute("aria-expanded", String(open));
  };

  const buildCatalog = () => {
    const list = document.createElement("nav");
    list.className = "work-menu-list";
    window.portfolioGroups.forEach((group) => {
      const link = document.createElement("a");
      const dot = document.createElement("span");
      dot.className = "work-menu-dot";
      dot.textContent = "\u25cf";
      link.href = "viewer.html?image=" + (group.ranges || [group.range])[0][0];
      link.style.setProperty("--text-hover-color", faviconColors[Math.floor(Math.random() * faviconColors.length)]);
      link.append(dot, group.title);
      list.appendChild(link);
    });
    menu.appendChild(list);
  };

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (!menu.firstChild) buildCatalog();
    setOpen(!menu.classList.contains("is-open"));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      const page = window.location.pathname.split("/").pop() || "index.html";
      const scroll = String(window.scrollY);
      const returnUrl = page === "index.html"
        ? "index.html?return=1&scroll=" + scroll
        : page + window.location.search + window.location.hash;
      sessionStorage.setItem("viewer-return-url", returnUrl);
      sessionStorage.setItem("home-return-scroll", scroll);
      sessionStorage.removeItem("home-return-image");
      setOpen(false);
    } else if (event.target === menu) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
      trigger.focus();
    }
  });
}

createWorkMenu();
