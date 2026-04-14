(function () {
  ("use strict");

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };
  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  const decorateAuthButtons = () => {
    let authButtons = select(
      "#Dashboard, #loginButton, #SignOut, #loginButtonContainer a, #SignOutContainer a",
      true
    );
    authButtons.forEach((btn) => {
      btn.classList.add("nav-auth-chip");
    });
  };

  const enhanceNavbarMarkup = () => {
    let header = select("#header");
    let nav = select("#navbar");
    if (!header || !nav) return;

    let shell = select("#header > .container");
    if (shell) shell.classList.add("nav-shell");

    let logo = select("#header .logo");
    if (logo) logo.classList.add("nav-brand");

    let authAnchor = select("#navbar #loginButtonContainer")
      ? select("#navbar #loginButtonContainer")
      : select("#navbar #SignOutContainer");
    let authLi = authAnchor ? authAnchor.closest("li") : null;
    if (authLi) authLi.classList.add("nav-auth-item");

    let dashboard = select("#Dashboard");
    if (dashboard) dashboard.classList.add("nav-auth-chip");

    let topLinks = select("#navbar > ul > li > a.nav-link", true);
    topLinks.forEach((link) => {
      if (link.classList.contains("nav-hover-link")) return;
      if (link.closest(".dropdown")) return;
      if (link.querySelector(".nav-text-stack")) return;

      let text = (link.textContent || "").trim();
      if (!text) return;

      link.classList.add("nav-hover-link");
      link.textContent = "";

      let stack = document.createElement("span");
      stack.className = "nav-text-stack";

      let first = document.createElement("span");
      first.textContent = text;
      let second = document.createElement("span");
      second.textContent = text;

      stack.appendChild(first);
      stack.appendChild(second);
      link.appendChild(stack);
    });

    decorateAuthButtons();
  };

  enhanceNavbarMarkup();

  let loginContainer = select("#loginButtonContainer");
  let signoutContainer = select("#SignOutContainer");
  if (window.MutationObserver && (loginContainer || signoutContainer)) {
    const authObserver = new MutationObserver(() => {
      enhanceNavbarMarkup();
    });

    if (loginContainer) {
      authObserver.observe(loginContainer, { childList: true, subtree: true });
    }

    if (signoutContainer) {
      authObserver.observe(signoutContainer, {
        childList: true,
        subtree: true,
      });
    }
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select("#header");
    let offset = header.offsetHeight;

    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: "smooth",
    });
  };

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select("#header");
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add("header-scrolled");
      } else {
        selectHeader.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("load", headerScrolled);
    onscroll(document, headerScrolled);
  }

  /**
   * Back to top button
   */
  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Mobile nav toggle
   */
  let headerShapeTimeout;
  const syncHeaderShape = () => {
    let header = select("#header");
    let navbar = select("#navbar");
    if (!header || !navbar) return;

    if (headerShapeTimeout) {
      clearTimeout(headerShapeTimeout);
    }

    if (navbar.classList.contains("navbar-mobile")) {
      header.classList.add("nav-open");
      return;
    }

    headerShapeTimeout = setTimeout(() => {
      if (!navbar.classList.contains("navbar-mobile")) {
        header.classList.remove("nav-open");
      }
    }, 300);
  };

  on("click", ".mobile-nav-toggle", function (e) {
    select("#navbar").classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
    syncHeaderShape();
  });

  /**
   * Mobile nav dropdowns activate
   */
  on(
    "click",
    ".navbar .dropdown > a",
    function (e) {
      if (select("#navbar").classList.contains("navbar-mobile")) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle("dropdown-active");
      }
    },
    true
  );

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();

        let navbar = select("#navbar");
        if (navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
          syncHeaderShape();
        }
        scrollto(this.hash);
      }
    },
    true
  );

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener("load", () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
    syncHeaderShape();
  });

  /**
   * Preloader
   */

  let preloader = select("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Initiate  glightbox
   */
  const glightbox = GLightbox({
    selector: ".glightbox",
  });

  /**
   * Skills animation
   */
  let skilsContent = select(".skills-content");
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: "80%",
      handler: function (direction) {
        let progress = select(".progress .progress-bar", true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute("aria-valuenow") + "%";
        });
      },
    });
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener("load", () => {
    let portfolioContainer = select(".portfolio-container");
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: ".portfolio-item",
      });

      let portfolioFilters = select("#portfolio-flters li", true);

      on(
        "click",
        "#portfolio-flters li",
        function (e) {
          e.preventDefault();
          portfolioFilters.forEach(function (el) {
            el.classList.remove("filter-active");
          });
          this.classList.add("filter-active");

          portfolioIsotope.arrange({
            filter: this.getAttribute("data-filter"),
          });
          portfolioIsotope.on("arrangeComplete", function () {
            AOS.refresh();
          });
        },
        true
      );
    }
  });

  /**
   * Initiate portfolio lightbox
   */
  const portfolioLightbox = GLightbox({
    selector: ".portfolio-lightbox",
  });

  /**
   * Portfolio details slider
   */
  new Swiper(".portfolio-details-slider", {
    speed: 400,
    loop: true,
    // autoplay: {
    //   delay: 3000,
    //   disableOnInteraction: true,
    // },
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
  });

  /**
   * Animation on scroll
   */
  window.addEventListener("load", () => {
    let contentImages = select("main img", true);
    contentImages.forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    AOS.init({
      duration: 550,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
      offset: 60,
      disable: reduceMotion || window.innerWidth < 768,
      debounceDelay: 50,
      throttleDelay: 99,
    });
  });
})();
