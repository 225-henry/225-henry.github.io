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

  const count = document.createElement("span");
  count.className = "catalog-moving-count";
  count.textContent = trigger.textContent.replace(/[()]/g, "").trim();
  count.setAttribute("aria-hidden", "true");
  document.body.appendChild(count);
  let transitionId = 0;
  const setOpen = (open) => {
    const id = ++transitionId;
    const wasVisible = menu.classList.contains("is-open") || menu.classList.contains("is-closing");
    const parentheses = [...menu.querySelectorAll(".work-menu-parenthesis")];
    const currentTransforms = parentheses.map((parenthesis) => getComputedStyle(parenthesis).transform);
    const countWasMoving = count.getAnimations().length > 0;
    const countStyle = getComputedStyle(count);
    const countTransform = countStyle.transform;
    const countOpacity = countStyle.opacity;
    count.getAnimations().forEach((animation) => animation.cancel());
    const links = [...menu.querySelectorAll(".work-menu-list a")];
    const linkStyles = links.map((link) => {
      const style = getComputedStyle(link);
      return { opacity: style.opacity };
    });
    links.forEach((link) => {
      link.getAnimations().forEach((animation) => animation.cancel());
    });
    parentheses.forEach((parenthesis) => {
      parenthesis.getAnimations().forEach((animation) => animation.cancel());
    });
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    menu.classList.toggle("is-open", open);
    menu.classList.toggle("is-closing", !open && wasVisible && animate);
    menu.inert = !open;
    menu.setAttribute("aria-hidden", String(!open));
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Close catalog" : "Open catalog");
    trigger.classList.toggle("is-catalog-away", open || (wasVisible && animate));
    count.style.visibility = "hidden";
    if (animate && (open || wasVisible)) {
      const origin = trigger.getBoundingClientRect();
      const catalog = menu.querySelector(".work-menu-list").getBoundingClientRect();
      const centerX = catalog.left + catalog.width / 2;
      const centerY = catalog.top + catalog.height / 2;
      const timing = { duration: 420, easing: "ease-out", fill: "forwards" };
      const motions = parentheses.map((parenthesis, index) => {
        const destination = parenthesis.getBoundingClientRect();
        const x = (index === 0 ? origin.left : origin.right - destination.width) - destination.left;
        const y = origin.top + origin.height / 2 - (destination.top + destination.height / 2);
        const headerTransform = `translateY(-50%) translate(${x}px, ${y}px)`;
        return parenthesis.animate([
          { transform: wasVisible ? currentTransforms[index] : headerTransform },
          { transform: open ? "translateY(-50%)" : headerTransform }
        ], timing);
      });
      const headerCount = `translate(${origin.left + origin.width / 2}px, ${origin.top + origin.height / 2}px) translate(-50%, -50%)`;
      const catalogCount = `translate(${centerX}px, ${centerY}px) translate(-50%, -50%)`;
      count.style.visibility = "visible";
      motions.push(count.animate([
        { transform: countWasMoving ? countTransform : open ? headerCount : catalogCount, opacity: countWasMoving ? countOpacity : open ? 1 : 0 },
        { transform: open ? catalogCount : headerCount, opacity: open ? 0 : 1 }
      ], timing));
      links.forEach((link, index) => {
        motions.push(link.animate([
          wasVisible ? linkStyles[index] : { opacity: 0 },
          { opacity: open ? 1 : 0 }
        ], { ...timing, fill: "both" }));
      });
      Promise.all(motions.map((motion) => motion.finished)).then(() => {
        if (id !== transitionId) return;
        menu.classList.remove("is-closing");
        trigger.classList.toggle("is-catalog-away", open);
        count.style.visibility = "hidden";
        motions.forEach((motion) => motion.cancel());
      }).catch(() => {});
    }
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
    ["(", ")"].forEach((character) => {
      const parenthesis = document.createElement("span");
      parenthesis.className = "work-menu-parenthesis";
      parenthesis.setAttribute("aria-hidden", "true");
      parenthesis.textContent = character;
      list.appendChild(parenthesis);
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
