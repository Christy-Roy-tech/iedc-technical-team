(function () {
  "use strict";

  const layeredText = document.getElementById("layeredText");
  const layeredList = layeredText
    ? layeredText.querySelector(".layered-text-list")
    : null;
  const timestampInput = document.getElementById("dateandtime");
  const submitButton = document.getElementById("submit");
  const phoneInput = document.getElementById("phno");

  function getFormattedTimestamp() {
    const now = new Date();
    const date = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return `${date}, ${time}`;
  }

  function updateTimestamp() {
    if (timestampInput) {
      timestampInput.value = getFormattedTimestamp();
    }
  }

  function clampPhoneDigits() {
    if (!phoneInput) {
      return;
    }

    const onlyDigits = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    phoneInput.value = onlyDigits;
  }

  function buildLayeredText() {
    if (!layeredList) {
      return;
    }

    const isSmallScreen = window.innerWidth < 768;

    const lines = [
      "BIG IDEA SUBMISSION",
      "IDEATE . PROTOTYPE . SCALE",
      "SAINTGITS IEDC",
      "TURN CONCEPTS INTO VENTURES",
      "BIG IDEA SUBMISSION",
      "SAINTGITS IEDC",
    ];

    if (!layeredList.children.length) {
      layeredList.innerHTML = lines
        .map((text, index) => {
          const directionClass = index % 2 === 0 ? "odd" : "even";
          return `
            <li class="layered-line ${directionClass}">
              <p>${text}</p>
            </li>
          `;
        })
        .join("");
    }

    const lineElements = layeredList.querySelectorAll(".layered-line p");
    const total = lineElements.length || 1;

    lineElements.forEach((line, index) => {
      const scale = 1.02 - (index / total) * 0.18;
      const opacity = 0.88 - (index / total) * 0.5;
      const vwSize = (isSmallScreen ? 7.3 : 4.4) - index * (isSmallScreen ? 0.56 : 0.34);
      const remCap = (isSmallScreen ? 2.2 : 3.4) - index * (isSmallScreen ? 0.14 : 0.2);

      line.style.fontSize = `clamp(${isSmallScreen ? "0.95rem" : "1.05rem"}, ${Math.max(vwSize, 1.45).toFixed(2)}vw, ${Math.max(remCap, 1.45).toFixed(2)}rem)`;
      line.style.transform = `scale(${Math.max(scale, 0.8).toFixed(3)})`;
      line.style.opacity = `${Math.max(opacity, 0.28).toFixed(2)}`;
    });
  }

  function animateLayeredText() {
    if (!layeredText || !window.gsap) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const lines = layeredText.querySelectorAll(".layered-line p");

    gsap.from(".portal-hero .eyebrow, .portal-hero h1, .portal-hero .hero-copy", {
      y: 24,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
    });

    gsap.from(lines, {
      y: 18,
      opacity: 0,
      duration: 0.72,
      stagger: 0.06,
      ease: "power2.out",
      delay: 0.15,
    });

    gsap.from(".portal-info .info-card", {
      y: 28,
      opacity: 0,
      duration: 0.75,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.2,
    });

    gsap.from(".form-shell", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.25,
    });

    if (reduceMotion) {
      return;
    }

    lines.forEach((line, index) => {
      gsap.to(line, {
        x: index % 2 === 0 ? -8 : 8,
        duration: 6 + index * 0.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    if (!hoverCapable) {
      return;
    }

    layeredText.addEventListener("pointermove", (event) => {
      const bounds = layeredText.getBoundingClientRect();
      const midpoint = bounds.left + bounds.width / 2;
      const diff = (event.clientX - midpoint) / bounds.width;
      const tilt = Math.max(Math.min(diff * 18, 8), -8);

      lines.forEach((line, index) => {
        const dir = index % 2 === 0 ? -1 : 1;
        gsap.to(line, {
          x: dir * tilt,
          duration: 0.45,
          overwrite: true,
          ease: "power2.out",
        });
      });
    });

    layeredText.addEventListener("pointerleave", () => {
      lines.forEach((line) => {
        gsap.to(line, {
          x: 0,
          duration: 0.55,
          overwrite: true,
          ease: "power2.out",
        });
      });
    });
  }

  buildLayeredText();
  animateLayeredText();
  updateTimestamp();

  window.addEventListener("resize", () => {
    buildLayeredText();
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      updateTimestamp();
    }
  });

  window.addEventListener("focus", updateTimestamp);

  if (submitButton) {
    submitButton.addEventListener("click", updateTimestamp);
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", clampPhoneDigits);
  }
})();
