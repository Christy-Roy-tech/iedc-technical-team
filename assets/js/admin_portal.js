import { firebaseConfig } from "./firebase.js";
/* Config values inlined to prevent module crash if config.js is missing on deployment */
const CLOUDINARY_CLOUD_NAME = "dtz3a6oxn";
const CLOUDINARY_UPLOAD_PRESET = "iedc_uploads";
const IMGBB_API_KEY = "371192ecce95dd54ec3de29ae55e7146";
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
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

function loadAndInitCircularGallery(items) {
  if (document.getElementById("circular-gallery-container") || document.querySelector(".portfolio-container")) {
    import("./circular_gallery.js").then(({ initCircularGallery }) => {
      initCircularGallery(items);
    }).catch(e => console.warn("Could not load 3D circular gallery script:", e));
  }
};

/* ── Config ─────────────────────────────────────────────────── */
const ADMIN_EMAIL = "iedcsaintgits@gmail.com";

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
const adminLoginSubmit = document.getElementById("admin-login-submit") || document.querySelector(".admin-login-submit");
const adminLoginBtnText = document.querySelector(".admin-login-btn-text");
const adminLoginSpinner = document.querySelector(".admin-login-spinner");
const adminLoginStatus = document.getElementById("admin-login-status");
const adminLoggedInBar = document.getElementById("admin-logged-in-bar");
const adminLoggedInEmail = document.getElementById("admin-logged-in-email");
const adminSignOutButton = document.getElementById("admin-signout") || document.getElementById("adminSignOutButton") || document.querySelector(".admin-signout");
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
const eventImageInput = document.getElementById("admin-event-image");
const eventImagePreview = document.getElementById("admin-event-image-preview");
const eventDescInput = document.getElementById("admin-event-desc");
const eventDeleteButton = document.getElementById("admin-event-delete");
const eventFeedback = document.getElementById("admin-event-feedback");
const eventList = document.getElementById("admin-event-list");

let currentEventId = "";
let eventsCache = new Map();

/* ── Utilities ──────────────────────────────────────────────── */

function setStatus(el, message, tone) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("is-error", "is-success");
  if (tone === "error") el.classList.add("is-error");
  if (tone === "success") el.classList.add("is-success");
};

/* ── Robust Image Upload (Event Manager setup + ImgBB + Base64 fallback) ── */

async function uploadImage(file) {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported image type: ${file.type}. Use JPEG, PNG, GIF, or WebP.`);
  }

  // Validate file size (max 10 MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error("Image too large. Maximum size is 10 MB.");
  }

  // Tier 1: Try exact working Cloudinary config used in Event Management (`dtz3a6oxn` + `iedc_uploads`)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "iedc_uploads");
    const cloudName = CLOUDINARY_CLOUD_NAME || "dtz3a6oxn";
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      return {
        imageUrl: data.secure_url,
        deleteUrl: "",
        thumb: data.eager?.[0]?.secure_url || data.secure_url,
      };
    }
  } catch (e) {
    console.warn("Primary Event Manager Cloudinary upload failed, checking ImgBB fallback...", e);
  }

  // Tier 2: Try ImgBB API (`api.imgbb.com/1/upload`)
  try {
    const imgbbKey = window.IMGBB_API_KEY || (typeof IMGBB_API_KEY !== "undefined" ? IMGBB_API_KEY : "371192ecce95dd54ec3de29ae55e7146");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`https://api.imgbb.com/v1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) {
        return {
          imageUrl: data.data.url,
          deleteUrl: data.data.delete_url || "",
          thumb: data.data.thumb?.url || data.data.display_url || data.data.url,
        };
      }
    }
  } catch (e) {
    console.warn("ImgBB upload failed, attempting Base64 fallback...", e);
  }

  // Tier 3: Guaranteed fallback via FileReader (Base64 Data URL) ensuring image is always saved!
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        imageUrl: reader.result,
        deleteUrl: "",
        thumb: reader.result,
      });
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
};

/* ── Inline Login ───────────────────────────────────────────── */

function setLoginLoading(loading) {
  const liveSubmit = document.getElementById("admin-login-submit") || adminLoginSubmit;
  const liveBtnText = document.querySelector(".admin-login-btn-text") || adminLoginBtnText;
  const liveSpinner = document.querySelector(".admin-login-spinner") || adminLoginSpinner;
  if (!liveSubmit) return;
  liveSubmit.disabled = loading;
  if (liveBtnText) liveBtnText.hidden = loading;
  if (liveSpinner) liveSpinner.hidden = !loading;
};

async function handleInlineLogin(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  const liveEmailInput = document.getElementById("admin-email") || adminEmailInput;
  const livePasswordInput = document.getElementById("admin-password") || adminPasswordInput;
  const liveStatus = document.getElementById("admin-login-status") || adminLoginStatus;

  if (!liveEmailInput || !livePasswordInput) return;

  const email = liveEmailInput.value.trim();
  const password = livePasswordInput.value;

  if (!email || !password) {
    setStatus(liveStatus, "Enter email and password.", "error");
    return;
  }

  setLoginLoading(true);
  setStatus(liveStatus, "Signing in...", "");

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    setStatus(liveStatus, "Authenticated! Unlocking Gallery & Event Manager...", "success");
    updateAdminUI(userCred.user || auth.currentUser);
  } catch (error) {
    console.error("Login error:", error);
    // Show FULL error detail for debugging
    const errDetail = error.code 
      ? `[${error.code}] ${error.message}` 
      : `[${error.name || "Error"}] ${error.message || error.toString()}`;
    
    let msg = "";
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
    else if (error.code === "auth/network-request-failed")
      msg = "Network error. Check your internet connection.";
    else
      msg = "Login failed.";
    
    msg += " DEBUG: " + errDetail;

    setStatus(liveStatus, msg, "error");
    setLoginLoading(false);
  }
};

function initAdminPortalListeners() {
  const liveTogglePassword = document.getElementById("admin-toggle-password");
  if (liveTogglePassword && !liveTogglePassword.dataset.listenerAttached) {
    liveTogglePassword.dataset.listenerAttached = "true";
    liveTogglePassword.addEventListener("click", () => {
      const livePassInput = document.getElementById("admin-password");
      if (!livePassInput) return;
      const isPassword = livePassInput.type === "password";
      livePassInput.type = isPassword ? "text" : "password";
      const icon = liveTogglePassword.querySelector("i");
      if (icon) {
        icon.className = isPassword ? "bi bi-eye" : "bi bi-eye-slash";
      }
    });
  }

  const liveLoginForm = document.getElementById("admin-login-form");
  if (liveLoginForm && !liveLoginForm.dataset.listenerAttached) {
    liveLoginForm.dataset.listenerAttached = "true";
    liveLoginForm.addEventListener("submit", handleInlineLogin);
  }

  const liveGalleryForm = document.getElementById("admin-gallery-form");
  if (liveGalleryForm && !liveGalleryForm.dataset.listenerAttached) {
    liveGalleryForm.dataset.listenerAttached = "true";
    liveGalleryForm.addEventListener("submit", handleGalleryUpload);
  }

  const liveCancelEditBtn = document.getElementById("admin-gallery-cancel-edit");
  if (liveCancelEditBtn && !liveCancelEditBtn.dataset.listenerAttached) {
    liveCancelEditBtn.dataset.listenerAttached = "true";
    liveCancelEditBtn.addEventListener("click", cancelGalleryEdit);
  }

  const liveEventForm = document.getElementById("admin-event-form");
  if (liveEventForm && !liveEventForm.dataset.listenerAttached) {
    liveEventForm.dataset.listenerAttached = "true";
    liveEventForm.addEventListener("submit", handleEventSubmit);
  }

  const liveEventSelect = document.getElementById("admin-event-select");
  if (liveEventSelect && !liveEventSelect.dataset.listenerAttached) {
    liveEventSelect.dataset.listenerAttached = "true";
    liveEventSelect.addEventListener("change", () => {
      const selectedId = liveEventSelect.value;
      if (!selectedId) {
        clearEventForm();
        return;
      }
      const data = eventsCache.get(selectedId);
      currentEventId = selectedId;
      fillEventForm(data);
    });
  }

  const liveEventNewBtn = document.getElementById("admin-event-new");
  if (liveEventNewBtn && !liveEventNewBtn.dataset.listenerAttached) {
    liveEventNewBtn.dataset.listenerAttached = "true";
    liveEventNewBtn.addEventListener("click", () => clearEventForm());
  }

  const liveEventDelBtn = document.getElementById("admin-event-delete");
  if (liveEventDelBtn && !liveEventDelBtn.dataset.listenerAttached) {
    liveEventDelBtn.dataset.listenerAttached = "true";
    liveEventDelBtn.addEventListener("click", handleEventDelete);
  }
};

initAdminPortalListeners();
document.addEventListener("DOMContentLoaded", initAdminPortalListeners);

/* ── Gallery: Portfolio Rendering ───────────────────────────── */

function createPortfolioItem(item) {
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

function waitForImages(elements) {
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
function getIsotopeInstance() {
  if (!portfolioContainer || !window.Isotope) return null;
  try {
    return window.Isotope.data(portfolioContainer) || null;
  } catch (_) {
    return null;
  }
};

function refreshLightbox() {
  if (window.GLightbox) {
    GLightbox({ selector: ".portfolio-lightbox" });
  }
};

async function fetchGalleryItems() {
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

let renderGeneration = 0;

function renderPublicGallery(items) {
  /* Initialize interactive 3D Circular WebGL Gallery with full color photos */
  const circularItems = (items || [])
    .filter((it) => it && it.imageUrl)
    .map((it) => ({
      image: it.imageUrl,
      text: it.title || "IEDC Snapshot",
    }));
  loadAndInitCircularGallery(circularItems);

  if (!portfolioContainer) return;

  const thisGen = ++renderGeneration;
  const iso = getIsotopeInstance();

  /* ── 1. Remove previously-added dynamic items ── */
  const existingDynamic = portfolioContainer.querySelectorAll(
    "[data-gallery-id]"
  );
  if (existingDynamic.length) {
    if (iso) {
      try { iso.remove(existingDynamic); } catch (_) {}
    }
    // Always remove from DOM as fallback (items may not be in Isotope yet)
    existingDynamic.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
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
    if (thisGen !== renderGeneration) return; // a newer render superseded this one
    requestAnimationFrame(() => {
      if (thisGen !== renderGeneration) return;
      const latestIso = getIsotopeInstance();
      if (latestIso) {
        latestIso.appended(newElements);
        latestIso.layout();
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

/* ── Gallery: Admin List & Edit/Remove ──────────────────────── */

let currentEditingGalleryId = null;

function renderGalleryList(items) {
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
    body.appendChild(title);

    if (item.caption) {
      const caption = document.createElement("div");
      caption.className = "admin-status";
      caption.textContent = item.caption;
      body.appendChild(caption);
    }

    const btnRow = document.createElement("div");
    btnRow.className = "d-flex gap-2 mt-2 flex-wrap";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "admin-btn admin-btn-secondary";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      currentEditingGalleryId = item.id;
      if (galleryTitleInput) galleryTitleInput.value = item.title || "";
      if (galleryCaptionInput) galleryCaptionInput.value = item.caption || "";
      if (galleryFileInput) {
        galleryFileInput.removeAttribute("required");
        galleryFileInput.value = "";
      }
      const submitBtn = document.getElementById("admin-gallery-submit");
      if (submitBtn) submitBtn.textContent = "Update Gallery Photo";
      const cancelBtn = document.getElementById("admin-gallery-cancel-edit");
      if (cancelBtn) cancelBtn.style.display = "inline-block";

      if (galleryPreview) {
        galleryPreview.innerHTML = `<img src="${item.thumb || item.imageUrl}" alt="Editing photo" />`;
        galleryPreview.setAttribute("aria-hidden", "false");
      }
      setStatus(galleryStatus, `Editing photo: "${item.title || 'item'}"`, "");
      galleryForm?.scrollIntoView({ behavior: "smooth" });
    });

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
        if (currentEditingGalleryId === item.id) cancelGalleryEdit();
        await refreshGallery();
      } catch (error) {
        console.error("Error deleting gallery item:", error);
        setStatus(galleryStatus, "Failed to remove item.", "error");
      }
    });

    btnRow.appendChild(editButton);
    btnRow.appendChild(removeButton);
    body.appendChild(btnRow);

    card.appendChild(body);
    galleryList.appendChild(card);
  });
};

async function refreshGallery() {
  const items = await fetchGalleryItems();
  renderPublicGallery(items);
  renderGalleryList(items);
};

/* ── Gallery: Preview, Cancel & Upload/Update ───────────────── */

function showPreview(file) {
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

function cancelGalleryEdit() {
  currentEditingGalleryId = null;
  galleryForm?.reset();
  if (galleryFileInput) galleryFileInput.setAttribute("required", "true");
  const submitBtn = document.getElementById("admin-gallery-submit");
  if (submitBtn) submitBtn.textContent = "Upload to Gallery";
  const cancelBtn = document.getElementById("admin-gallery-cancel-edit");
  if (cancelBtn) cancelBtn.style.display = "none";
  showPreview(null);
  setStatus(galleryStatus, "", "");
};

async function handleGalleryUpload(event) {
  event.preventDefault();
  if (!currentEditingGalleryId && (!galleryFileInput || !galleryFileInput.files.length)) {
    setStatus(galleryStatus, "Select an image to upload.", "error");
    return;
  }

  const file = galleryFileInput.files && galleryFileInput.files.length ? galleryFileInput.files[0] : null;
  if (file && file.size > 10 * 1024 * 1024) {
    setStatus(galleryStatus, "Image too large. Max 10 MB.", "error");
    return;
  }

  setStatus(galleryStatus, currentEditingGalleryId ? "Updating image..." : "Uploading image...", "");

  try {
    let result = null;
    if (file) {
      result = await uploadImage(file);
    }

    if (currentEditingGalleryId) {
      const updateData = {
        title: galleryTitleInput?.value.trim() || "",
        caption: galleryCaptionInput?.value.trim() || "",
        updatedAt: serverTimestamp(),
      };
      if (result) {
        updateData.imageUrl = result.imageUrl;
        updateData.thumb = result.thumb;
        if (result.deleteUrl !== undefined) updateData.deleteUrl = result.deleteUrl;
      }
      await updateDoc(doc(db, "Gallery", currentEditingGalleryId), updateData);
      setStatus(galleryStatus, "Gallery photo updated successfully!", "success");
    } else {
      await addDoc(collection(db, "Gallery"), {
        title: galleryTitleInput?.value.trim() || "",
        caption: galleryCaptionInput?.value.trim() || "",
        imageUrl: result.imageUrl,
        thumb: result.thumb,
        deleteUrl: result?.deleteUrl || "",
        createdAt: serverTimestamp(),
      });
      setStatus(galleryStatus, "Gallery image added to collection successfully!", "success");
    }

    cancelGalleryEdit();
    await refreshGallery();
  } catch (error) {
    console.error("Error saving gallery item:", error);
    setStatus(
      galleryStatus,
      error.message || "Save failed. Check your connection and try again.",
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

const cancelEditBtn = document.getElementById("admin-gallery-cancel-edit");
if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", cancelGalleryEdit);
}

/* ── Events: CRUD ───────────────────────────────────────────── */

function clearEventForm() {
  currentEventId = "";
  eventForm?.reset();
  if (eventImagePreview) {
    eventImagePreview.innerHTML = "";
    eventImagePreview.setAttribute("aria-hidden", "true");
  }
  if (eventFlagSelect) eventFlagSelect.value = "active";
  if (eventDeleteButton) eventDeleteButton.disabled = true;
  if (eventSelect) eventSelect.value = "";
  setStatus(eventFeedback, "", "");
};

function fillEventForm(eventData) {
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
  eventDescInput.value = eventData.desc || "";
  eventFlagSelect.value = eventData.flag === "active" ? "active" : "false";

  if (eventImagePreview && eventData.imageUrl) {
    eventImagePreview.innerHTML = `<img src="${eventData.imageUrl}" alt="Event Image">`;
    eventImagePreview.setAttribute("aria-hidden", "false");
  } else if (eventImagePreview) {
    eventImagePreview.innerHTML = "";
    eventImagePreview.setAttribute("aria-hidden", "true");
  }

  eventDeleteButton.disabled = false;
};

function renderEventSelect(events) {
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

function renderEventList(events) {
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

async function loadEvents() {
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

async function handleEventSubmit(event) {
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

  setStatus(eventFeedback, "Saving event...", "");

  let imageUrl = eventsCache.get(currentEventId)?.imageUrl || "";

  // If a new image is selected, upload it
  if (eventImageInput && eventImageInput.files.length > 0) {
    try {
      setStatus(eventFeedback, "Uploading image...", "");
      const uploadResult = await uploadImage(eventImageInput.files[0]);
      imageUrl = uploadResult.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      setStatus(eventFeedback, error.message || "Failed to upload image.", "error");
      return;
    }
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
    desc: eventDescInput.value.trim(),
    imageUrl,
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

if (eventImageInput) {
  eventImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && eventImagePreview) {
      const url = URL.createObjectURL(file);
      eventImagePreview.innerHTML = `<img src="${url}" alt="Preview">`;
      eventImagePreview.setAttribute("aria-hidden", "false");
    }
  });
}

async function handleEventDelete() {
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

function updateAdminUI(user) {
  initAdminPortalListeners();
  // Show navbar Admin Portal link only when admin is logged in
  const adminNavItem = document.getElementById("adminNavLoginItem");
  if (adminNavItem) {
    adminNavItem.style.display = (user && user.email === ADMIN_EMAIL) ? "" : "none";
  }

  // Load public gallery for visitors across any page
  if (portfolioContainer || document.getElementById("circular-gallery-container")) {
    fetchGalleryItems().then(renderPublicGallery);
  }

  // Dynamically fetch elements to ensure always up to date even if DOM was loaded after script parse
  const liveAdminTools = document.getElementById("admin-tools") || adminTools;
  const liveAdminLoginCard = document.getElementById("admin-login-card") || adminLoginCard;
  const liveAdminLoginForm = document.getElementById("admin-login-form") || adminLoginForm;
  const liveAdminLoggedInBar = document.getElementById("admin-logged-in-bar") || adminLoggedInBar;
  const liveAdminLoggedInEmail = document.getElementById("admin-logged-in-email") || adminLoggedInEmail;

  if (!liveAdminTools && !liveAdminLoginCard) return;

  const effectiveUser = user || auth.currentUser;
  if (effectiveUser && effectiveUser.email && effectiveUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    // Authenticated admin
    if (liveAdminLoginForm) liveAdminLoginForm.hidden = true;
    if (liveAdminLoginCard) {
      liveAdminLoginCard.hidden = true;
      liveAdminLoginCard.style.setProperty("display", "none", "important");
    }
    if (liveAdminLoggedInBar) {
      liveAdminLoggedInBar.hidden = false;
      liveAdminLoggedInBar.style.setProperty("display", "flex", "important");
    }
    if (liveAdminLoggedInEmail) {
      liveAdminLoggedInEmail.textContent = `Signed in as ${effectiveUser.email}`;
    }
    if (liveAdminTools) {
      liveAdminTools.hidden = false;
      liveAdminTools.style.setProperty("display", "block", "important");
      liveAdminTools.classList.add("admin-tools-visible");
    }
    setStatus(adminLoginStatus, "", "");
    setLoginLoading(false);

    loadEvents();
    refreshGallery(); // loads both public gallery + admin list
  } else {
    // Not admin or not logged in
    if (liveAdminLoginForm) liveAdminLoginForm.hidden = false;
    if (liveAdminLoginCard) {
      liveAdminLoginCard.hidden = false;
      liveAdminLoginCard.style.setProperty("display", "block", "important");
    }
    if (liveAdminLoggedInBar) {
      liveAdminLoggedInBar.hidden = true;
      liveAdminLoggedInBar.style.setProperty("display", "none", "important");
    }
    if (liveAdminTools) {
      liveAdminTools.hidden = true;
      liveAdminTools.style.display = "none";
      liveAdminTools.classList.remove("admin-tools-visible");
    }

    if (effectiveUser) {
      setStatus(
        adminLoginStatus,
        `Signed in as ${effectiveUser.email}. Admin access required.`,
        "error"
      );
    }
    setLoginLoading(false);
  }
}

if (adminSignOutButton) {
  adminSignOutButton.addEventListener("click", () => {
    signOut(auth).then(() => {
      if (window.location.pathname.includes("/pages/admin/")) {
        window.location.href = "../../index.html";
      }
    }).catch((error) => {
      console.error("Sign out failed:", error);
    });
  });
}

if (document.getElementById("circular-gallery-container") && !portfolioContainer) {
  loadAndInitCircularGallery([]);
}

// Immediate initial sync check
updateAdminUI(auth.currentUser);
onAuthStateChanged(auth, updateAdminUI);
