(function () {
  "use strict";

  const layeredText = document.getElementById("layeredText");
  const layeredList = layeredText
    ? layeredText.querySelector(".layered-text-list")
    : null;
  const timestampInput = document.getElementById("dateandtime");
  const submitButton = document.getElementById("submit");
  const phoneInput = document.getElementById("phno");
  const LAYER_LINE_HEIGHT_DESKTOP = 74;
  const LAYER_LINE_HEIGHT_MOBILE = 44;
  const LAYER_OFFSET_DESKTOP = 44;
  const LAYER_OFFSET_MOBILE = 24;
  const layerWords = [
    "BIG IDEA",
    "INNOVATION",
    "PROTOTYPE",
    "VALIDATION",
    "VENTURE",
    "GROWTH",
    "IMPACT",
    "FOUNDERS",
    "FUTURE",
  ];
  const layerLines = [
    { top: "\u00A0", bottom: layerWords[0] },
    ...layerWords.slice(0, -1).map((word, index) => ({
      top: word,
      bottom: layerWords[index + 1],
    })),
    { top: layerWords[layerWords.length - 1], bottom: "\u00A0" },
  ];

  let flowTimeline = null;

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

  function isSmallScreen() {
    return window.innerWidth < 768;
  }

  function getLayerLineHeight() {
    return isSmallScreen() ? LAYER_LINE_HEIGHT_MOBILE : LAYER_LINE_HEIGHT_DESKTOP;
  }

  function getLayerOffset() {
    return isSmallScreen() ? LAYER_OFFSET_MOBILE : LAYER_OFFSET_DESKTOP;
  }

  function buildLayeredText() {
    if (!layeredList) {
      return;
    }

    const lineHeight = getLayerLineHeight();
    const offset = getLayerOffset();
    const centerIndex = Math.floor(layerLines.length / 2);

    layeredList.innerHTML = "";

    layerLines.forEach((line, index) => {
      const tx = (index - centerIndex) * offset;
      const skew = index % 2 === 0 ? "58deg,-30deg" : "0deg,-30deg";
      const scaleY = index % 2 === 0 ? 0.67 : 1.33;

      const li = document.createElement("li");
      li.className = `layered-line ${index % 2 === 0 ? "even" : "odd"}`;
      li.style.cssText = `height:${lineHeight}px; transform:translateX(${tx}px) skew(${skew}) scaleY(${scaleY});`;

      [line.top, line.bottom].forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        p.style.cssText = `height:${lineHeight}px; line-height:${lineHeight - 5}px;`;
        li.appendChild(p);
      });

      layeredList.appendChild(li);
    });
  }

  function buildLayeredTextTimeline() {
    if (!layeredList || !window.gsap) {
      return;
    }

    const allLines = layeredList.querySelectorAll("p");
    if (!allLines.length) {
      return;
    }

    if (flowTimeline) {
      flowTimeline.kill();
      flowTimeline = null;
    }

    gsap.set(allLines, { y: 0 });

    flowTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    flowTimeline.to(allLines, {
      y: -getLayerLineHeight(),
      duration: 1.05,
      ease: "power2.inOut",
      stagger: 0.07,
    });
  }

  function animatePortalEntry() {
    if (!window.gsap) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.from(".portal-hero .eyebrow, .portal-hero h1, .portal-hero .hero-copy", {
      y: 24,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
    });

    gsap.from(".layered-line", {
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

    gsap.to(".layered-line", {
      y: -2,
      duration: 2.4,
      ease: "sine.inOut",
      stagger: {
        each: 0.04,
        from: "center",
        yoyo: true,
        repeat: -1,
      },
    });
  }

  function refreshLayeredText() {
    buildLayeredText();
    buildLayeredTextTimeline();
  }

  refreshLayeredText();
  animatePortalEntry();
  updateTimestamp();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }

    resizeTimer = window.setTimeout(() => {
      refreshLayeredText();
    }, 120);
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
