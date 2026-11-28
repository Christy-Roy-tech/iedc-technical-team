import { firebaseConfig } from "./firebase.js";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

const BRANCH_SHORT_CODES = {
  ECE: "EC",
  EEE: "EE",
  CSE: "CS",
  RB: "RB",
  ER: "ER",
  EV: "EV",
  CE: "CE",
  ME: "ME",
};

function generateTrackingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IEDC-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateGroupId(members) {
  const prefix = members
    .map((m) => `${BRANCH_SHORT_CODES[m.branch] || m.branch}-${m.year}`)
    .join("-");
  let seq = 1;
  try {
    const snap = await db.collection("ideas").get();
    seq = snap.size + 1;
  } catch (e) {
    seq = Math.floor(Math.random() * 90) + 10;
  }
  return `${prefix}-${String(seq).padStart(2, "0")}`;
}

function showToast(icon, title) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  Toast.fire({ icon, title });
}

function downloadTicket(trackingCode, groupId, groupName, ideatitle) {
  const content = [
    "IEDC SAINTGITS - GROUP IDEA SUBMISSION TICKET",
    "==============================================",
    `Tracking Code : ${trackingCode}`,
    `Group ID      : ${groupId}`,
    `Group Name    : ${groupName}`,
    `Idea Title    : ${ideatitle}`,
    `Status        : Pending`,
    "",
    "Keep this tracking code safe. You can check your idea",
    "status anytime on the Idea Portal using this code.",
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trackingCode}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function readMember(prefix) {
  return {
    name: document.getElementById(`${prefix}_name`).value.trim(),
    branch: document.getElementById(`${prefix}_branch`).value,
    year: document.getElementById(`${prefix}_year`).value,
    semester: document.getElementById(`${prefix}_sem`).value,
    email: document.getElementById(`${prefix}_email`).value.trim(),
    phone: document.getElementById(`${prefix}_phone`).value.trim(),
  };
}

function validateMember(m, label) {
  if (!m.name || !m.branch || !m.year || !m.semester || !m.email || !m.phone) {
    showToast("error", `Please fill all fields for ${label}`);
    return false;
  }
  if (m.phone.length !== 10) {
    showToast("error", `${label} phone number must be 10 digits`);
    return false;
  }
  return true;
}

// Toggle 3rd member
const toggleMember3Btn = document.getElementById("toggleMember3Btn");
const member3Section = document.getElementById("member3Section");
let hasMember3 = false;

if (toggleMember3Btn && member3Section) {
  toggleMember3Btn.addEventListener("click", () => {
    hasMember3 = !hasMember3;
    member3Section.style.display = hasMember3 ? "block" : "none";
    toggleMember3Btn.textContent = hasMember3
      ? "- Remove 3rd Member"
      : "+ Add 3rd Member (Optional)";
  });
}

// Public tracking code lookup
const trackBtn = document.getElementById("trackBtn");
const trackCodeInput = document.getElementById("trackCodeInput");
const trackResult = document.getElementById("trackResult");

async function lookupTrackingCode() {
  if (!trackCodeInput || !trackResult) return;
  const code = trackCodeInput.value.trim().toUpperCase();
  if (!code) {
    trackResult.style.display = "block";
    trackResult.innerHTML = `<div class="alert alert-warning mb-0">Please enter a tracking code.</div>`;
    return;
  }

  trackResult.style.display = "block";
  trackResult.innerHTML = `<div class="text-muted small">Searching...</div>`;

  try {
    const snapshot = await db
      .collection("ideas")
      .where("trackingCode", "==", code)
      .limit(1)
      .get();

    if (snapshot.empty) {
      trackResult.innerHTML = `<div class="alert alert-danger mb-0">No idea found with tracking code <strong>${code}</strong>.</div>`;
      return;
    }

    const data = snapshot.docs[0].data();
    const status = data.status || "Pending";
    let badgeClass = "bg-warning text-dark";
    if (status === "Approved") badgeClass = "bg-success";
    else if (status === "Disapproved") badgeClass = "bg-danger";

    const adminMsgHtml = data.adminMessage
      ? `<p class="mb-0 mt-2 small"><strong>Admin Message:</strong><br>${data.adminMessage}</p>`
      : `<p class="mb-0 mt-2 small text-muted">No message from the review team yet.</p>`;

    trackResult.innerHTML = `
      <div class="p-3 rounded border" style="background: rgba(255,255,255,0.05);">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>${data.ideatitle || "Untitled Idea"}</strong>
          <span class="badge ${badgeClass}">${status}</span>
        </div>
        <div class="small text-muted">Group: ${data.groupName || "N/A"} (${data.groupId || "N/A"})</div>
        <div class="small text-muted">Code: ${data.trackingCode}</div>
        ${adminMsgHtml}
      </div>
    `;
  } catch (err) {
    console.error("Error looking up tracking code:", err);
    trackResult.innerHTML = `<div class="alert alert-danger mb-0">Unable to fetch status right now. Please try again later.</div>`;
  }
}

if (trackBtn) trackBtn.addEventListener("click", lookupTrackingCode);
if (trackCodeInput) {
  trackCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      lookupTrackingCode();
    }
  });
}

// Auto-load logged-in user's submitted ideas
async function loadMySubmittedIdeas(uid) {
  const card = document.getElementById("my-ideas-card");
  const list = document.getElementById("myIdeasList");
  if (!card || !list) return;

  card.style.display = "block";
  list.innerHTML = `<div class="small text-muted">Loading your submissions...</div>`;

  try {
    const snap = await db
      .collection("ideas")
      .where("submittedByUid", "==", uid)
      .get();

    if (snap.empty) {
      list.innerHTML = `<div class="small text-muted">You haven't submitted any group ideas yet.</div>`;
      return;
    }

    list.innerHTML = snap.docs
      .map((d) => {
        const data = d.data();
        const status = data.status || "Pending";
        const badgeClass =
          status === "Approved"
            ? "bg-success"
            : status === "Disapproved"
              ? "bg-danger"
              : "bg-warning text-dark";
        const msg = data.adminMessage
          ? `<div class="small mt-1"><strong>Admin:</strong> ${data.adminMessage}</div>`
          : "";
        return `
          <div class="p-2 mb-2 rounded border" style="background: rgba(255,255,255,0.04);">
            <div class="d-flex justify-content-between align-items-center">
              <strong class="small">${data.ideatitle || "Untitled"}</strong>
              <span class="badge ${badgeClass}">${status}</span>
            </div>
            <div class="small text-muted">Group ID: ${data.groupId || "N/A"} | Code: ${data.trackingCode || "N/A"}</div>
            ${msg}
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading user ideas:", err);
    list.innerHTML = `<div class="small text-danger">Could not load your submissions.</div>`;
  }
}

let currentUser = null;
const loginPrompt = document.getElementById("loginPrompt");
const ideaFormContainer = document.getElementById("ideaFormContainer");
const submitBtn = document.getElementById("submit");

auth.onAuthStateChanged((user) => {
  currentUser = user;
  if (user) {
    if (loginPrompt) loginPrompt.style.display = "none";
    if (ideaFormContainer) ideaFormContainer.style.display = "block";
    const m1Email = document.getElementById("m1_email");
    if (m1Email && !m1Email.value && user.email) {
      m1Email.value = user.email;
    }
    loadMySubmittedIdeas(user.uid);
  } else {
    if (loginPrompt) loginPrompt.style.display = "block";
    if (ideaFormContainer) ideaFormContainer.style.display = "none";
    const card = document.getElementById("my-ideas-card");
    if (card) card.style.display = "none";
  }
});

if (submitBtn) {
  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      Swal.fire({
        title: "Login Required",
        text: "Please log in first to submit a group idea.",
        icon: "info",
        confirmButtonText: "Go to Login",
      }).then(() => {
        window.location.href = "./login.html";
      });
      return;
    }

    const groupName = document.getElementById("groupName").value.trim();
    const ideatitle = document.getElementById("ideatitle").value.trim();
    const description = document.getElementById("description").value.trim();
    const insights = document.getElementById("insights").value.trim();
    const timestamp =
      document.getElementById("dateandtime").value || new Date().toISOString();

    if (!groupName || !ideatitle || !description || !insights) {
      showToast("error", "Please fill Group Name and all Idea details");
      return;
    }

    const m1 = readMember("m1");
    const m2 = readMember("m2");
    if (!validateMember(m1, "Member 1") || !validateMember(m2, "Member 2")) {
      return;
    }

    const members = [m1, m2];
    if (hasMember3) {
      const m3 = readMember("m3");
      if (!validateMember(m3, "Member 3")) return;
      members.push(m3);
    }

    submitBtn.disabled = true;
    try {
      const trackingCode = generateTrackingCode();
      const groupId = await generateGroupId(members);

      await db.collection("ideas").add({
        groupName,
        groupId,
        members,
        submittedByUid: currentUser.uid,
        submittedByEmail: currentUser.email || m1.email,
        // Keep legacy top-level fields for compatibility
        firstname: m1.name,
        lname: "",
        email: m1.email,
        phno: m1.phone,
        year: m1.year,
        branch: m1.branch,
        ideatitle,
        description,
        insights,
        timestamp,
        trackingCode,
        status: "Pending",
        adminMessage: "",
      });

      Swal.fire({
        title: "Group Idea Submitted!",
        html: `
          <p><strong>Group ID:</strong> ${groupId}</p>
          <p>Your tracking code is:</p>
          <h3 style="letter-spacing: 2px; font-weight: 700; color: #0d6efd;">${trackingCode}</h3>
          <p style="font-size: 0.9rem; margin-top: 10px;">
            You can check the status of your idea anytime on this website by typing this tracking code, or simply by logging in.
            <strong>Please save, screenshot, or download your ticket!</strong>
          </p>
        `,
        icon: "success",
        showDenyButton: true,
        confirmButtonText: "Continue",
        denyButtonText: "Download Ticket",
      }).then((result) => {
        if (result.isDenied) {
          downloadTicket(trackingCode, groupId, groupName, ideatitle);
        }
        window.location.reload();
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      Swal.fire({
        title: "Submission Failed",
        text: error.message || "Could not submit your idea. Please try again.",
        icon: "error",
      });
    } finally {
      submitBtn.disabled = false;
    }
  });
}
