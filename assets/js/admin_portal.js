import { firebaseConfig } from "./firebase.js";
import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

/* ── Config ─────────────────────────────────────────────────── */
const ADMIN_EMAIL = "iedcsaintgits@gmail.com";
const IMGBB_API_KEY = "8188019ccf19d6e972da7dce8df8559a";

/* ── Firebase init ──────────────────────────────────────────── */
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ── DOM refs ───────────────────────────────────────────────── */
const portfolioContainer = document.querySelector(".portfolio-container");

// Login elements
const adminLoginCard = document.getElementById("admin-login-card");
const adminLoginForm = document.getElementById("admin-login-form");
const adminEmailInput = document.getElementById("admin-email");
const adminPasswordInput = document.getElementById("admin-password");
const adminTogglePassword = document.getElementById("admin-toggle-password");
const adminLoginSubmit = document.querySelector(".admin-login-submit");
const adminLoginBtnText = document.querySelector(".admin-login-btn-text");
const adminLoginSpinner = document.querySelector(".admin-login-spinner");
const adminLoginStatus = document.getElementById("admin-login-status");
const adminLoggedInBar = document.getElementById("admin-logged-in-bar");
const adminLoggedInEmail = document.getElementById("admin-logged-in-email");
const adminSignOutButton = document.getElementById("admin-signout");
const adminTools = document.getElementById("admin-tools");

// Gallery elements
const galleryForm = document.getElementById("admin-gallery-form");
const galleryFileInput = document.getElementById("admin-gallery-file");
const galleryTitleInput = document.getElementById("admin-gallery-title");
const galleryCaptionInput = document.getElementById("admin-gallery-caption");
const galleryStatus = document.getElementById("admin-gallery-status");
const galleryList = document.getElementById("admin-gallery-list");
const galleryPreview = document.getElementById("admin-gallery-preview");

// Event elements
const eventSelect = document.getElementById("admin-event-select");
const eventNewButton = document.getElementById("admin-event-new");
const eventForm = document.getElementById("admin-event-form");
const eventNameInput = document.getElementById("admin-event-name");
const eventStartDateInput = document.getElementById("admin-event-start-date");
const eventStartTimeInput = document.getElementById("admin-event-start-time");
const eventEndDateInput = document.getElementById("admin-event-end-date");
const eventEndTimeInput = document.getElementById("admin-event-end-time");
const eventLocationInput = document.getElementById("admin-event-location");
const eventLinkInput = document.getElementById("admin-event-link");
const eventLastDateInput = document.getElementById("admin-event-last-date");
const eventRequirementsInput = document.getElementById("admin-event-req");
const eventFlagSelect = document.getElementById("admin-event-flag");
const eventDeleteButton = document.getElementById("admin-event-delete");
const eventFeedback = document.getElementById("admin-event-feedback");
const eventList = document.getElementById("admin-event-list");

let currentEventId = "";
let eventsCache = new Map();

/* ── Utilities ──────────────────────────────────────────────── */

const setStatus = (el, message, tone) => {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("is-error", "is-success");
  if (tone === "error") el.classList.add("is-error");
  if (tone === "success") el.classList.add("is-success");
};

/* ── ImgBB Upload ───────────────────────────────────────────── */

const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: "POST", body: formData }
  );

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Image upload failed");
  }

  return {
    imageUrl: data.data.display_url,
    deleteUrl: data.data.delete_url || "",
    thumb: data.data.thumb?.url || data.data.display_url,
  };
};

/* ── Inline Login ───────────────────────────────────────────── */

const setLoginLoading = (loading) => {
  if (!adminLoginSubmit) return;
  adminLoginSubmit.disabled = loading;
  if (adminLoginBtnText) adminLoginBtnText.hidden = loading;
  if (adminLoginSpinner) adminLoginSpinner.hidden = !loading;
};

const handleInlineLogin = async (e) => {
  e.preventDefault();
  if (!adminEmailInput || !adminPasswordInput) return;

  const email = adminEmailInput.value.trim();
  const password = adminPasswordInput.value;

  if (!email || !password) {
    setStatus(adminLoginStatus, "Enter email and password.", "error");
    return;
  }

  setLoginLoading(true);
  setStatus(adminLoginStatus, "Signing in...", "");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle the UI update
  } catch (error) {
    console.error("Login error:", error);
    let msg = "Login failed. Please try again.";
    if (error.code === "auth/invalid-email") msg = "Invalid email address.";
    else if (
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential" ||
      error.code === "auth/invalid-login-credentials"
    )
      msg = "Incorrect email or password.";
    else if (error.code === "auth/user-not-found")
      msg = "No account found with this email.";
    else if (error.code === "auth/too-many-requests")
      msg = "Too many attempts. Try again later.";

    setStatus(adminLoginStatus, msg, "error");
    setLoginLoading(false);
  }
};

// Password visibility toggle
if (adminTogglePassword && adminPasswordInput) {
  adminTogglePassword.addEventListener("click", () => {
    const isPassword = adminPasswordInput.type === "password";
    adminPasswordInput.type = isPassword ? "text" : "password";
    const icon = adminTogglePassword.querySelector("i");
    if (icon) {
      icon.className = isPassword ? "bi bi-eye" : "bi bi-eye-slash";
    }
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", handleInlineLogin);
}

/* ── Gallery: Portfolio Rendering ───────────────────────────── */

const createPortfolioItem = (item) => {
  const wrapper = document.createElement("div");
  wrapper.className = "col-lg-4 col-md-6 portfolio-item";
  wrapper.dataset.galleryId = item.id;

  const imgWrap = document.createElement("div");
  imgWrap.className = "portfolio-img";

  const img = document.createElement("img");
  img.src = item.imageUrl;
  img.alt = item.title || "Gallery photo";
  img.loading = "lazy";
  img.decoding = "async";
  img.className = "img-fluid";
  imgWrap.appendChild(img);

  const info = document.createElement("div");
  info.className = "portfolio-info";

  const title = document.createElement("h4");
  title.textContent = item.title || "Gallery";
  info.appendChild(title);

  if (item.caption) {
    const caption = document.createElement("p");
    caption.textContent = item.caption;
    info.appendChild(caption);
  }

  const link = document.createElement("a");
  link.href = item.imageUrl;
  link.className = "portfolio-lightbox preview-link";
  link.setAttribute("data-gallery", "portfolioGallery");
  link.title = item.title || "Gallery photo";
  const icon = document.createElement("i");
  icon.className = "bi-arrow-up-right-circle-fill";
  link.appendChild(icon);
  info.appendChild(link);

  wrapper.appendChild(imgWrap);
  wrapper.appendChild(info);

  return wrapper;
};

const waitForImages = (elements) => {
  const images = [];
  elements.forEach((el) => {
    const imgs = el.tagName === "IMG" ? [el] : el.querySelectorAll("img");
    images.push(...imgs);
  });
  const promises = images.map((img) => {
    if (img.complete && img.naturalHeight > 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  });
  return Promise.all(promises);
};

/** Get the live Isotope instance that main.js created, or null. */
const getIsotopeInstance = () => {
  if (!portfolioContainer || !window.Isotope) return null;
  try {
    return window.Isotope.data(portfolioContainer) || null;
  } catch (_) {
    return null;
  }
};

const refreshLightbox = () => {
  if (window.GLightbox) {
    GLightbox({ selector: ".portfolio-lightbox" });
  }
};

const fetchGalleryItems = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Gallery"));
    const items = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    return items;
  } catch (error) {
    console.error("Error loading gallery:", error);
    return [];
  }
};

const renderPublicGallery = (items) => {
  if (!portfolioContainer) return;

  const iso = getIsotopeInstance();

  /* ── 1. Remove previously-added dynamic items ── */
  const existingDynamic = portfolioContainer.querySelectorAll(
    "[data-gallery-id]"
  );
  if (existingDynamic.length) {
    if (iso) {
      iso.remove(existingDynamic);
    } else {
      existingDynamic.forEach((node) => node.remove());
    }
  }

  if (!items.length) {
    if (iso) iso.layout();
    refreshLightbox();
    return;
  }

  /* ── 2. Create new DOM elements ── */
  const newElements = [];
  items.forEach((item) => {
    if (!item.imageUrl) return;
    const el = createPortfolioItem(item);
    newElements.push(el);
  });

  if (!newElements.length) {
    if (iso) iso.layout();
    refreshLightbox();
    return;
  }

  /* ── 3. Append to DOM ── */
  const fragment = document.createDocumentFragment();
  newElements.forEach((el) => fragment.appendChild(el));
  portfolioContainer.appendChild(fragment);

  /* ── 4. Wait for images, then tell Isotope about new items ── */
  waitForImages(newElements).then(() => {
    // Extra frame to let browser finish its layout pass
    requestAnimationFrame(() => {
      if (iso) {
        iso.appended(newElements);
        iso.layout();
      } else if (window.Isotope) {
        new Isotope(portfolioContainer, {
          itemSelector: ".portfolio-item",
          layoutMode: "masonry",
        });
      }

      if (window.AOS) AOS.refresh();
      refreshLightbox();
    });
  });
};

/* ── Gallery: Admin List ────────────────────────────────────── */

const renderGalleryList = (items) => {
  if (!galleryList) return;
  galleryList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "admin-status";
    empty.textContent = "No gallery items yet.";
    galleryList.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "admin-gallery-item";

    const img = document.createElement("img");
    img.src = item.thumb || item.imageUrl;
    img.alt = item.title || "Gallery item";
    card.appendChild(img);

    const body = document.createElement("div");
    body.className = "admin-gallery-item-body";

    const title = document.createElement("div");
    title.className = "admin-gallery-item-title";
    title.textContent = item.title || "Untitled";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "admin-btn admin-btn-danger";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", async () => {
      const confirmed = window.confirm(
        "Remove this gallery item? This cannot be undone."
      );
      if (!confirmed) return;

      try {
        await deleteDoc(doc(db, "Gallery", item.id));
        setStatus(galleryStatus, "Gallery item removed.", "success");
        await refreshGallery();
      } catch (error) {
        console.error("Error deleting gallery item:", error);
        setStatus(galleryStatus, "Failed to remove item.", "error");
      }
    });

    body.appendChild(title);
    if (item.caption) {
      const caption = document.createElement("div");
      caption.className = "admin-status";
      caption.textContent = item.caption;
      body.appendChild(caption);
    }
    body.appendChild(removeButton);
    card.appendChild(body);
    galleryList.appendChild(card);
  });
};

const refreshGallery = async () => {
  const items = await fetchGalleryItems();
  renderPublicGallery(items);
  renderGalleryList(items);
};

/* ── Gallery: Preview & Upload ──────────────────────────────── */

const showPreview = (file) => {
  if (!galleryPreview) return;
  galleryPreview.innerHTML = "";
  if (!file) {
    galleryPreview.setAttribute("aria-hidden", "true");
    return;
  }

  const img = document.createElement("img");
  const url = URL.createObjectURL(file);
  img.src = url;
  img.alt = "Selected gallery image";
  img.onload = () => URL.revokeObjectURL(url);
  galleryPreview.appendChild(img);
  galleryPreview.setAttribute("aria-hidden", "false");
};

const handleGalleryUpload = async (event) => {
  event.preventDefault();
  if (!galleryFileInput || !galleryFileInput.files.length) {
    setStatus(galleryStatus, "Select an image to upload.", "error");
    return;
  }

  const file = galleryFileInput.files[0];

  // File size check (max 32 MB for ImgBB)
  if (file.size > 32 * 1024 * 1024) {
    setStatus(galleryStatus, "Image too large. Max 32 MB.", "error");
    return;
  }

  setStatus(galleryStatus, "Uploading image...", "");

  try {
    const result = await uploadToImgBB(file);

    await addDoc(collection(db, "Gallery"), {
      title: galleryTitleInput.value.trim(),
      caption: galleryCaptionInput.value.trim(),
      imageUrl: result.imageUrl,
      thumb: result.thumb,
      deleteUrl: result.deleteUrl,
      createdAt: serverTimestamp(),
    });

    galleryForm.reset();
    showPreview(null);
    setStatus(galleryStatus, "Gallery image uploaded!", "success");
    await refreshGallery();
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    setStatus(
      galleryStatus,
      "Upload failed. Check your connection and try again.",
      "error"
    );
  }
};

if (galleryFileInput) {
  galleryFileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    showPreview(file || null);
  });
}

if (galleryForm) {
  galleryForm.addEventListener("submit", handleGalleryUpload);
}

/* ── Events: CRUD ───────────────────────────────────────────── */

const clearEventForm = () => {
  currentEventId = "";
  eventForm?.reset();
  if (eventFlagSelect) eventFlagSelect.value = "active";
  if (eventDeleteButton) eventDeleteButton.disabled = true;
  if (eventSelect) eventSelect.value = "";
  setStatus(eventFeedback, "", "");
};

const fillEventForm = (eventData) => {
  if (!eventData) return;
  eventNameInput.value = eventData.name || "";
  eventStartDateInput.value = eventData.startdate || "";
  eventStartTimeInput.value = eventData.time || "";
  eventEndDateInput.value = eventData.enddate || "";
  eventEndTimeInput.value = eventData.timet || "";
  eventLocationInput.value = eventData.local || "";
  eventLinkInput.value = eventData.link || "";
  eventLastDateInput.value = eventData.lastedate || "";
  eventRequirementsInput.value = eventData.reqirments || "";
  eventFlagSelect.value = eventData.flag === "active" ? "active" : "false";
  eventDeleteButton.disabled = false;
};

const renderEventSelect = (events) => {
  if (!eventSelect) return;
  eventSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Create new event";
  eventSelect.appendChild(placeholder);

  events.forEach((eventData) => {
    const option = document.createElement("option");
    option.value = eventData.id;
    option.textContent = eventData.name || eventData.id;
    eventSelect.appendChild(option);
  });
};

const renderEventList = (events) => {
  if (!eventList) return;
  eventList.innerHTML = "";

  if (!events.length) {
    const empty = document.createElement("p");
    empty.className = "admin-status";
    empty.textContent = "No events yet.";
    eventList.appendChild(empty);
    return;
  }

  events.forEach((eventData) => {
    const row = document.createElement("div");
    row.className = "admin-event-list-item";

    const name = document.createElement("span");
    name.textContent = eventData.name || eventData.id;

    const status = document.createElement("span");
    status.className = "admin-event-status-pill";
    if (eventData.flag !== "active") {
      status.classList.add("inactive");
      status.textContent = "inactive";
    } else {
      status.textContent = "active";
    }

    row.appendChild(name);
    row.appendChild(status);
    eventList.appendChild(row);
  });
};

const loadEvents = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Events"));
    const events = [];
    eventsCache = new Map();

    snapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      events.push(data);
      eventsCache.set(docSnap.id, data);
    });

    renderEventSelect(events);
    renderEventList(events);
  } catch (error) {
    console.error("Error loading events:", error);
    setStatus(eventFeedback, "Could not load events.", "error");
  }
};

const handleEventSubmit = async (event) => {
  event.preventDefault();

  const name = eventNameInput.value.trim();
  if (!name) {
    setStatus(eventFeedback, "Event name is required.", "error");
    return;
  }

  const safeId = name.replace(/\//g, "-");
  if (!currentEventId) {
    currentEventId = safeId;
  }

  const payload = {
    name,
    startdate: eventStartDateInput.value.trim(),
    time: eventStartTimeInput.value.trim(),
    enddate: eventEndDateInput.value.trim(),
    timet: eventEndTimeInput.value.trim(),
    link: eventLinkInput.value.trim(),
    lastedate: eventLastDateInput.value.trim(),
    local: eventLocationInput.value.trim(),
    reqirments: eventRequirementsInput.value.trim(),
    flag: eventFlagSelect.value,
  };

  try {
    await setDoc(doc(db, "Events", currentEventId), payload, { merge: true });
    setStatus(eventFeedback, "Event saved.", "success");
    eventDeleteButton.disabled = false;
    await loadEvents();
    if (eventSelect) eventSelect.value = currentEventId;
  } catch (error) {
    console.error("Error saving event:", error);
    setStatus(eventFeedback, "Failed to save event.", "error");
  }
};

const handleEventDelete = async () => {
  if (!currentEventId) return;
  const confirmed = window.confirm(
    "Delete this event? This cannot be undone."
  );
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "Events", currentEventId));
    setStatus(eventFeedback, "Event removed.", "success");
    clearEventForm();
    await loadEvents();
  } catch (error) {
    console.error("Error deleting event:", error);
    setStatus(eventFeedback, "Failed to remove event.", "error");
  }
};

if (eventSelect) {
  eventSelect.addEventListener("change", (event) => {
    const selectedId = event.target.value;
    if (!selectedId) {
      clearEventForm();
      return;
    }

    const data = eventsCache.get(selectedId);
    currentEventId = selectedId;
    fillEventForm(data);
  });
}

if (eventNewButton) {
  eventNewButton.addEventListener("click", () => clearEventForm());
}

if (eventForm) {
  eventForm.addEventListener("submit", handleEventSubmit);
}

if (eventDeleteButton) {
  eventDeleteButton.addEventListener("click", handleEventDelete);
}

/* ── Auth State → UI Toggle ─────────────────────────────────── */

const updateAdminUI = (user) => {
  if (!adminLoginCard || !adminTools) return;

  if (user && user.email === ADMIN_EMAIL) {
    // Authenticated admin
    if (adminLoginForm) adminLoginForm.hidden = true;
    if (adminLoggedInBar) adminLoggedInBar.hidden = false;
    if (adminLoggedInEmail) {
      adminLoggedInEmail.textContent = `Signed in as ${user.email}`;
    }
    adminTools.hidden = false;
    adminTools.classList.add("admin-tools-visible");
    setStatus(adminLoginStatus, "", "");
    setLoginLoading(false);

    loadEvents();
    refreshGallery();
  } else {
    // Not admin or not logged in
    if (adminLoginForm) adminLoginForm.hidden = false;
    if (adminLoggedInBar) adminLoggedInBar.hidden = true;
    adminTools.hidden = true;
    adminTools.classList.remove("admin-tools-visible");

    if (user) {
      // Logged in but not admin
      setStatus(
        adminLoginStatus,
        `Signed in as ${user.email}. Admin access required.`,
        "error"
      );
    }
    setLoginLoading(false);
  }
};

if (adminSignOutButton) {
  adminSignOutButton.addEventListener("click", () => {
    signOut(auth).catch((error) => {
      console.error("Sign out failed:", error);
    });
  });
}

onAuthStateChanged(auth, updateAdminUI);

/* ── Public gallery load (always runs) ──────────────────────── */
if (portfolioContainer) {
  fetchGalleryItems().then(renderPublicGallery);
}
