import { firebaseConfig } from "./firebase.js";

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
const usersCollection = db.collection("ideas");
const auth = firebase.auth();

function generateTrackingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IEDC-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function downloadTicket(trackingCode, ideatitle, fname, lname) {
  const content = [
    "IEDC SAINTGITS - IDEA SUBMISSION TICKET",
    "========================================",
    `Tracking Code : ${trackingCode}`,
    `Idea Title    : ${ideatitle}`,
    `Submitted By  : ${fname} ${lname}`,
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
        <div class="small text-muted">Code: ${data.trackingCode}</div>
        ${adminMsgHtml}
      </div>
    `;
  } catch (err) {
    console.error("Error looking up tracking code:", err);
    trackResult.innerHTML = `<div class="alert alert-danger mb-0">Unable to fetch status right now. Please try again later.</div>`;
  }
}

if (trackBtn) {
  trackBtn.addEventListener("click", lookupTrackingCode);
}
if (trackCodeInput) {
  trackCodeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      lookupTrackingCode();
    }
  });
}

auth.onAuthStateChanged((user) => {
  submit.addEventListener("click", (e) => {
    e.preventDefault();
    var fname = document.getElementById("fname").value;
    var lname = document.getElementById("lname").value;
    var email = document.getElementById("email").value;
    var phno = document.getElementById("phno").value;
    var year = document.getElementById("year").value;
    var branch = document.getElementById("branch").value;
    var ideatitle = document.getElementById("ideatitle").value;
    var description = document.getElementById("description").value;
    var timestamp = document.getElementById("dateandtime").value;
    var insights = document.getElementById("insights").value;
    if (
      (fname &&
        lname &&
        email &&
        phno &&
        year &&
        branch &&
        ideatitle &&
        description &&
        insights) === ""
    ) {
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

      Toast.fire({
        icon: "error",
        title: "please fill all the fields",
      });
    } else if (phno.length != "10") {
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

      Toast.fire({
        icon: "error",
        title: "phone number must a 10 digit number",
      });
    } else {
      const trackingCode = generateTrackingCode();
      db.collection("ideas")
        .add({
          firstname: fname,
          lname: lname,
          email: email,
          ideatitle: ideatitle,
          phno: phno,
          year: year,
          branch: branch,
          description: description,
          timestamp: timestamp,
          insights: insights,
          trackingCode: trackingCode,
          status: "Pending",
          adminMessage: "",
        })
        .then((docRef) => {
          Swal.fire({
            title: "Idea Submitted!",
            html: `
              <p>Your tracking code is:</p>
              <h3 style="letter-spacing: 2px; font-weight: 700; color: #0d6efd;">${trackingCode}</h3>
              <p style="font-size: 0.9rem; margin-top: 10px;">
                You can check the status of your idea anytime on this website by typing this tracking code.
                <strong>Please save, screenshot, or download your ticket!</strong>
              </p>
            `,
            icon: "success",
            showDenyButton: true,
            confirmButtonText: "Continue",
            denyButtonText: "Download Ticket",
          }).then((result) => {
            if (result.isDenied) {
              downloadTicket(trackingCode, ideatitle, fname, lname);
            }
            window.location.reload();
          });
        })
        .catch((error) => {
          console.log("Error adding document: ", error);
          Swal.fire({
            title: "Submission Failed",
            text: error.message || "Could not submit your idea. Please try again.",
            icon: "error",
          });
        });
    }
  });
});
