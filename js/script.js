// ============================================================
// Releaf Design and Construction — Site scripts
// ============================================================

// ---------- Mobile navigation ----------
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open);
});

nav.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Header shadow + back-to-top + hero parallax ----------
const header = document.getElementById("header");
const toTop = document.getElementById("toTop");
const heroBg = document.querySelector(".hero-bg");
const heroSketch = document.querySelector(".hero-sketch");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 10);
  toTop.classList.toggle("show", y > 500);

  // Parallax: hero layers drift slower than the page while the hero is on screen
  if (!reduceMotion && y < window.innerHeight) {
    if (heroBg) heroBg.style.transform = `translateY(${y * 0.25}px)`;
    if (heroSketch) heroSketch.style.transform = `translateY(${y * 0.12}px)`;
  }
});

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Active nav link on scroll ----------
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

// ---------- Reveal on scroll (staggered) ----------
// Cards inside the same grid fade in one after another instead of all at once.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (!entry.isIntersecting) return;

      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      const delay = reduceMotion ? 0 : Math.min(siblings.indexOf(el), 8) * 100;
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add("visible");
      // clear the delay afterwards so hover transitions stay instant
      setTimeout(() => { el.style.transitionDelay = ""; }, delay + 800);
      revealObserver.unobserve(el);
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Animated counters ----------
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1600;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat-num").forEach((el) => counterObserver.observe(el));

// ---------- Portfolio filter ----------
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;

    projectCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !show);
    });
  });
});

// ---------- Testimonial slider ----------
const sliderTrack = document.getElementById("sliderTrack");
const sliderDots = document.getElementById("sliderDots");
const slides = sliderTrack.children;
let slideIndex = 0;
let sliderTimer;

for (let i = 0; i < slides.length; i++) {
  const dot = document.createElement("button");
  dot.className = "slider-dot" + (i === 0 ? " active" : "");
  dot.setAttribute("aria-label", `Testimonial ${i + 1}`);
  dot.addEventListener("click", () => goToSlide(i, true));
  sliderDots.appendChild(dot);
}

function goToSlide(i, manual = false) {
  slideIndex = (i + slides.length) % slides.length;
  sliderTrack.style.transform = `translateX(-${slideIndex * 100}%)`;
  [...sliderDots.children].forEach((d, j) => d.classList.toggle("active", j === slideIndex));
  if (manual) restartSliderTimer();
}

function restartSliderTimer() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(slideIndex + 1), 6000);
}
restartSliderTimer();

// ---------- Portfolio lightbox ----------
const lightbox = document.getElementById("lightbox");
const lightboxMedia = document.getElementById("lightboxMedia");
const lightboxCaption = document.getElementById("lightboxCaption");
const allCards = [...projectCards];
let lightboxIndex = 0;

function visibleCards() {
  return allCards.filter((c) => !c.classList.contains("hidden"));
}

function openLightbox(card) {
  const cards = visibleCards();
  lightboxIndex = cards.indexOf(card);
  renderLightbox(cards);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function renderLightbox(cards) {
  const card = cards[lightboxIndex];
  const media = card.querySelector(".ph-img, img").cloneNode(true);
  lightboxMedia.replaceChildren(media);
  const category = card.querySelector("figcaption span").textContent;
  const title = card.querySelector("figcaption h3").textContent;
  lightboxCaption.innerHTML = `${title}<small>${category}</small>`;
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function stepLightbox(dir) {
  const cards = visibleCards();
  if (cards.length === 0) return;
  lightboxIndex = (lightboxIndex + dir + cards.length) % cards.length;
  
  // Slide out to side and fade out
  lightboxMedia.style.opacity = "0";
  lightboxMedia.style.transform = dir > 0 ? "translateX(24px)" : "translateX(-24px)";
  
  setTimeout(() => {
    renderLightbox(cards);
    // Position on other side pre-fade in
    lightboxMedia.style.transition = "none";
    lightboxMedia.style.transform = dir > 0 ? "translateX(-24px)" : "translateX(24px)";
    
    // trigger reflow
    lightboxMedia.offsetHeight;
    
    // restore transition and animate in
    lightboxMedia.style.transition = "";
    lightboxMedia.style.transform = "translateX(0)";
    lightboxMedia.style.opacity = "1";
  }, 220);
}

allCards.forEach((card) => card.addEventListener("click", () => openLightbox(card)));
document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
document.getElementById("lightboxPrev").addEventListener("click", () => stepLightbox(-1));
document.getElementById("lightboxNext").addEventListener("click", () => stepLightbox(1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") stepLightbox(-1);
  if (e.key === "ArrowRight") stepLightbox(1);
});

// ---------- Contact form & Success Modal ----------
const contactForm = document.getElementById("contactForm");
const successModal = document.getElementById("successModal");
const successModalText = document.getElementById("successModalText");
const successModalClose = document.getElementById("successModalClose");

if (contactForm && successModal) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const method = data.get("contact_method");
    const name = data.get("name");
    const phone = data.get("phone");
    const email = data.get("email");
    const service = data.get("service");
    const msg = data.get("message");

    let targetUrl = "";

    if (method === "email") {
      const subject = encodeURIComponent(`Project Inquiry — ${service}`);
      const body = encodeURIComponent(
        `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\n\n${msg}`
      );
      targetUrl = `mailto:supunidhanodya@gmail.com?subject=${subject}&body=${body}`;
      
      if (successModalText) {
        successModalText.textContent = "Opening your email client to send your inquiry. Thank you!";
      }
    } else {
      // WhatsApp formatting
      const text = encodeURIComponent(
        `*New Project Inquiry*\n\n` +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Email:* ${email}\n` +
        `*Service:* ${service}\n\n` +
        `*Details:*\n${msg}`
      );
      targetUrl = `https://wa.me/94774939597?text=${text}`;
      
      if (successModalText) {
        successModalText.textContent = "Opening WhatsApp to send your inquiry directly to Releaf. Thank you!";
      }
    }

    // Reset checkmark animations dynamically
    const checkmark = successModal.querySelector(".checkmark-check");
    const checkCircle = successModal.querySelector(".checkmark-circle");
    if (checkmark && checkCircle) {
      checkmark.style.animation = "none";
      checkCircle.style.animation = "none";
      checkmark.offsetHeight; // trigger reflow
      checkmark.style.animation = "";
      checkCircle.style.animation = "";
    }

    // Open Success Modal
    successModal.classList.add("open");
    successModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // disable scroll

    // Trigger open action after a small delay
    setTimeout(() => {
      if (method === "email") {
        window.location.href = targetUrl;
      } else {
        window.open(targetUrl, "_blank");
      }
    }, 1800);

    contactForm.reset();
  });

  const closeModal = () => {
    successModal.classList.remove("open");
    successModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  if (successModalClose) {
    successModalClose.addEventListener("click", closeModal);
  }
  
  successModal.addEventListener("click", (e) => {
    if (e.target === successModal) closeModal();
  });
}

// ---------- Cost Calculator ----------
const calcService = document.getElementById("calcService");
const calcQuality = document.getElementById("calcQuality");
const calcArea = document.getElementById("calcArea");
const areaVal = document.getElementById("areaVal");
const calcTotal = document.getElementById("calcTotal");
const breakdownMaterials = document.getElementById("breakdownMaterials");
const breakdownLabor = document.getElementById("breakdownLabor");
const breakdownDesign = document.getElementById("breakdownDesign");
const calcInquireBtn = document.getElementById("calcInquireBtn");
const floorBtns = document.querySelectorAll(".floor-btn");

let calcFloors = 1;

if (calcService && calcQuality && calcArea) {
  const baseRates = {
    drawings: 150,     // LKR per sq ft
    interior: 250,     // LKR per sq ft
    landscape: 450,    // LKR per sq ft
    build: 12500       // LKR per sq ft (average Galle rate in 2026 for high-quality standard residential builds)
  };

  const qualityMultipliers = {
    standard: 1.0,
    premium: 1.35,
    luxury: 1.75
  };

  const floorMultipliers = {
    1: 1.0,
    2: 1.08,
    3: 1.18,
    4: 1.28
  };

  function calculateEstimate() {
    const service = calcService.value;
    const quality = calcQuality.value;
    const area = parseInt(calcArea.value, 10);

    const baseRate = baseRates[service];
    const qualityMult = qualityMultipliers[quality];
    const floorMult = service === "build" || service === "drawings" ? floorMultipliers[calcFloors] : 1.0;

    const totalEstimate = baseRate * area * qualityMult * floorMult;
    
    // Formatter
    areaVal.textContent = area.toLocaleString();
    calcTotal.textContent = Math.round(totalEstimate).toLocaleString();

    // Visual breakdown ratios
    let matPct = 15, labPct = 15, desPct = 70; // Design only default
    if (service === "build") {
      matPct = 65;
      labPct = 28;
      desPct = 7;
    } else if (service === "landscape") {
      matPct = 50;
      labPct = 35;
      desPct = 15;
    }

    const matCost = totalEstimate * (matPct / 100);
    const labCost = totalEstimate * (labPct / 100);
    const desCost = totalEstimate * (desPct / 100);

    breakdownMaterials.textContent = `LKR ${Math.round(matCost).toLocaleString()}`;
    breakdownLabor.textContent = `LKR ${Math.round(labCost).toLocaleString()}`;
    breakdownDesign.textContent = `LKR ${Math.round(desCost).toLocaleString()}`;

    // Update bar fills
    const matFill = document.querySelector(".materials-fill");
    const labFill = document.querySelector(".labor-fill");
    const desFill = document.querySelector(".design-fill");

    if (matFill && labFill && desFill) {
      matFill.style.width = `${matPct}%`;
      labFill.style.width = `${labPct}%`;
      desFill.style.width = `${desPct}%`;
      
      matFill.parentElement.previousElementSibling.firstElementChild.textContent = `Materials & Structure (${matPct}%)`;
      labFill.parentElement.previousElementSibling.firstElementChild.textContent = `Finishing & Labor (${labPct}%)`;
      desFill.parentElement.previousElementSibling.firstElementChild.textContent = `Design & Supervision (${desPct}%)`;
    }
  }

  // Event listeners
  calcService.addEventListener("change", calculateEstimate);
  calcQuality.addEventListener("change", calculateEstimate);
  calcArea.addEventListener("input", calculateEstimate);

  floorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      floorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      calcFloors = parseInt(btn.dataset.floors, 10);
      calculateEstimate();
    });
  });

  // Inquiry button auto-fills form and scrolls
  if (calcInquireBtn) {
    calcInquireBtn.addEventListener("click", () => {
      const serviceText = calcService.options[calcService.selectedIndex].text;
      const qualityText = calcQuality.options[calcQuality.selectedIndex].text.split(" (")[0];
      const area = calcArea.value;
      const totalCost = calcTotal.textContent;

      const inquiryMsg = `Hi Releaf! I used your online Cost Calculator and generated an estimate of LKR ${totalCost} for a "${serviceText}" project.\n\nDetails:\n- Total Area: ${area} sq. ft.\n- Number of Floors: ${calcFloors}\n- Finish Quality: ${qualityText}\n\nI would love to discuss this with you and refine this estimate.`;

      // Set contact form inputs
      const formServiceSelect = document.querySelector("#contactForm select[name='service']");
      const formMessageTextarea = document.querySelector("#contactForm textarea[name='message']");
      const formNameInput = document.querySelector("#contactForm input[name='name']");

      if (formServiceSelect) {
        // Map service values
        const serviceMap = {
          drawings: "House Planning",
          interior: "Interior Design",
          landscape: "Landscape Design",
          build: "Construction & Renovation"
        };
        const mappedService = serviceMap[calcService.value];
        for (let option of formServiceSelect.options) {
          if (option.text.includes(mappedService) || option.text === mappedService) {
            formServiceSelect.value = option.value;
            break;
          }
        }
      }

      if (formMessageTextarea) {
        formMessageTextarea.value = inquiryMsg;
      }

      // Smooth scroll
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
          if (formNameInput) formNameInput.focus();
        }, 800);
      }
    });
  }

  // Initial calculation
  calculateEstimate();
}

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Drafting-style custom cursor ----------
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");
const cursorLabel = cursorRing ? cursorRing.querySelector(".cursor-label") : null;

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let isMoving = false;

if (cursorDot && cursorRing && !reduceMotion) {
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hasMouse) {
    // Show cursor on first mouse move
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.opacity = 1;
      cursorRing.style.opacity = 1;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(updateCursor);
      }
    });

    document.addEventListener("mouseleave", () => {
      cursorDot.style.opacity = 0;
      cursorRing.style.opacity = 0;
    });
    document.addEventListener("mouseenter", () => {
      cursorDot.style.opacity = 1;
      cursorRing.style.opacity = 1;
    });

    const addHover = (label = "") => {
      cursorDot.classList.add("hovered");
      cursorRing.classList.add("hovered");
      if (label && cursorLabel) {
        cursorLabel.textContent = label;
        cursorRing.classList.add("has-label");
      }
    };

    const removeHover = () => {
      cursorDot.classList.remove("hovered");
      cursorRing.classList.remove("hovered");
      cursorRing.classList.remove("has-label");
      if (cursorLabel) cursorLabel.textContent = "";
    };

    const attachHoverEvents = () => {
      document.querySelectorAll("a, button, .filter-btn, select, input, textarea, [role='button']").forEach((el) => {
        el.addEventListener("mouseenter", () => {
          let text = "";
          if (el.classList.contains("header-cta") || el.classList.contains("btn-primary") || el.type === "submit") {
            text = "GO";
          } else if (el.tagName === "A" && el.getAttribute("href") && el.getAttribute("href").startsWith("#")) {
            text = "LINK";
          } else if (el.classList.contains("filter-btn")) {
            text = "SORT";
          } else if (el.classList.contains("whatsapp")) {
            text = "CHAT";
          }
          addHover(text);
        });
        el.addEventListener("mouseleave", removeHover);
      });

      document.querySelectorAll(".project-card").forEach((el) => {
        el.addEventListener("mouseenter", () => addHover("VIEW"));
        el.addEventListener("mouseleave", removeHover);
      });
    };

    attachHoverEvents();

    const filterContainer = document.querySelector(".filter");
    if (filterContainer) {
      filterContainer.addEventListener("click", () => {
        setTimeout(attachHoverEvents, 50);
      });
    }
  }
}

function updateCursor() {
  cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  
  const ease = 0.15;
  ringX += (mouseX - ringX) * ease;
  ringY += (mouseY - ringY) * ease;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  
  if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
    requestAnimationFrame(updateCursor);
  } else {
    isMoving = false;
  }
}

// ---------- Hero slideshow ----------
const heroSlides = document.querySelectorAll(".hero-slideshow .slide");
const heroProjectName = document.getElementById("heroProjectName");
const heroProjectLoc = document.getElementById("heroProjectLoc");

if (heroSlides.length > 0) {
  const slideInfo = [
    { name: "Hillside Villa", loc: "Galle, Sri Lanka" },
    { name: "Courtyard Garden Retreat", loc: "Hikkaduwa, Sri Lanka" },
    { name: "Modern Tropical Bungalow", loc: "Imaduwa, Sri Lanka" }
  ];
  
  let currentSlide = 0;
  
  function nextSlide() {
    heroSlides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add("active");
    
    // Update badge details with a fade transition
    if (heroProjectName && heroProjectLoc) {
      heroProjectName.style.opacity = "0";
      heroProjectLoc.style.opacity = "0";
      
      setTimeout(() => {
        heroProjectName.textContent = slideInfo[currentSlide].name;
        heroProjectLoc.textContent = slideInfo[currentSlide].loc;
        heroProjectName.style.opacity = "1";
        heroProjectLoc.style.opacity = "1";
      }, 500);
    }
  }
  
  // Shift slide every 6 seconds
  setInterval(nextSlide, 6000);
}

// ---------- Packages Tab Switcher ----------
const tabButtons = document.querySelectorAll(".packages-tabs .tab-btn");
const buildingPackages = document.getElementById("buildingPackages");
const landscapePackages = document.getElementById("landscapePackages");
const buildingNotes = document.getElementById("buildingNotes");
const landscapeNotes = document.getElementById("landscapeNotes");
const packagesTitle = document.getElementById("packagesTitle");

if (tabButtons.length > 0) {
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Deactivate all tabs
      tabButtons.forEach(b => b.classList.remove("active"));
      // Activate clicked tab
      btn.classList.add("active");
      
      const tabType = btn.getAttribute("data-tab");
      
      if (tabType === "building") {
        // Show Building Packages
        buildingPackages.classList.remove("d-none");
        buildingNotes.classList.remove("d-none");
        landscapePackages.classList.add("d-none");
        landscapeNotes.classList.add("d-none");
        
        buildingPackages.classList.add("packages-grid-fade");
        setTimeout(() => buildingPackages.classList.remove("packages-grid-fade"), 500);
        
        if (packagesTitle) packagesTitle.textContent = "Architectural Building Design Packages — 2026";
      } else {
        // Show Landscape Packages
        landscapePackages.classList.remove("d-none");
        landscapeNotes.classList.remove("d-none");
        buildingPackages.classList.add("d-none");
        buildingNotes.classList.add("d-none");
        
        landscapePackages.classList.add("packages-grid-fade");
        setTimeout(() => landscapePackages.classList.remove("packages-grid-fade"), 500);
        
        if (packagesTitle) packagesTitle.textContent = "Landscape Architectural Design Packages — 2026";
      }
    });
  });
}
