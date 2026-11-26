import { firebaseConfig } from "./firebase.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  doc as firestoreDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const ideasQuery = query(collection(db, "ideas"), orderBy("timestamp", "desc"));
const querySnapshot = await getDocs(ideasQuery);
let collapse = 'collapse';
let count = 1;
querySnapshot.forEach((doc) => {
  const data = doc.data();
  const status = data.status || "Pending";
  const trackingCode = data.trackingCode || "N/A";
  const groupId = data.groupId || "N/A";
  const groupName = data.groupName || `${data.firstname || ""} ${data.lname || ""}`.trim();
  const adminMessage = data.adminMessage || "";
  let badgeClass = "bg-warning text-dark";
  if (status === "Approved") badgeClass = "bg-success";
  else if (status === "Disapproved") badgeClass = "bg-danger";

  const membersHtml = Array.isArray(data.members) && data.members.length
    ? data.members
        .map(
          (m, idx) => `
          <li>
            <strong>Member ${idx + 1}:</strong> ${m.name} (${m.branch} - Year ${m.year}, ${m.semester})<br>
            <small>Email: ${m.email} | Phone: ${m.phone}</small>
          </li>`
        )
        .join("")
    : `
      <li>Email: ${data.email || "N/A"}</li>
      <li>Phone: ${data.phno || "N/A"}</li>
      <li>Class: ${data.year || ""} ${data.branch || ""}</li>
    `;

  function displayEvent(eventData) {
    const eventContainer = document.getElementById("accordionFlushExample");
    const eventDiv = document.createElement("div");
    eventDiv.className = "accordion accordion-flush";
    const collapseId = collapse + count;
    eventDiv.innerHTML = `
      <div class="accordion-item" style="border:1px solid rgb(145 145 145 / 45%);border-radius: 8px;">
      <h2 class="accordion-header" style="border-radius: 5px;">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
      data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
            ${data.ideatitle} &emsp; | &emsp;<span>${groupName}</span>
            &emsp;<span class="badge bg-info text-dark ms-2">${groupId}</span>
            &emsp;<span class="badge bg-secondary ms-2">${trackingCode}</span>
            &emsp;<span class="badge ${badgeClass} ms-2" id="badge-${doc.id}">${status}</span>
          </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
          
          <div class="accordion-body">
          <span style="color:red">${data.timestamp}</span> 
              <ul class="idea-list">
                  <li>
                      Group Name: <strong>${groupName}</strong> | Group ID: <strong>${groupId}</strong>
                  </li>
                  <li>
                      Tracking Code: <strong>${trackingCode}</strong>
                  </li>
                  ${membersHtml}
                  <li>
                      Description: <br>
                      ${data.description}
                  </li>
                  <li>
                  Insights about the team and progress so far!: <br>
                  ${data.insights}
              </li>
                  
              </ul>
              <hr />
              <div class="mt-3">
                <label class="form-label fw-bold">Review Status</label>
                <select class="form-select mb-2" id="status-${doc.id}">
                  <option value="Pending" ${status === "Pending" ? "selected" : ""}>Pending</option>
                  <option value="Approved" ${status === "Approved" ? "selected" : ""}>Approved</option>
                  <option value="Disapproved" ${status === "Disapproved" ? "selected" : ""}>Disapproved</option>
                </select>
                <label class="form-label fw-bold">Message to Submitter</label>
                <textarea class="form-control mb-2" id="msg-${doc.id}" rows="2" placeholder="Add feedback or next steps...">${adminMessage}</textarea>
                <button type="button" class="btn btn-primary btn-sm" id="save-${doc.id}">Save Review</button>
                <span class="ms-2 small" id="feedback-${doc.id}"></span>
              </div>
          </div>
      </div>
  </div>
  </div>    
    `;
    count = count+1;

    eventContainer.appendChild(eventDiv);

    const saveBtn = document.getElementById(`save-${doc.id}`);
    saveBtn.addEventListener("click", async () => {
      const newStatus = document.getElementById(`status-${doc.id}`).value;
      const newMsg = document.getElementById(`msg-${doc.id}`).value.trim();
      const feedbackEl = document.getElementById(`feedback-${doc.id}`);
      const badgeEl = document.getElementById(`badge-${doc.id}`);

      saveBtn.disabled = true;
      feedbackEl.textContent = "Saving...";
      try {
        await updateDoc(firestoreDoc(db, "ideas", doc.id), {
          status: newStatus,
          adminMessage: newMsg,
        });
        badgeEl.textContent = newStatus;
        badgeEl.className = "badge ms-2 " + (
          newStatus === "Approved" ? "bg-success" :
          newStatus === "Disapproved" ? "bg-danger" :
          "bg-warning text-dark"
        );
        feedbackEl.textContent = "Saved!";
        feedbackEl.className = "ms-2 small text-success";
      } catch (err) {
        console.error("Failed to update idea:", err);
        feedbackEl.textContent = "Error saving: " + err.message;
        feedbackEl.className = "ms-2 small text-danger";
      } finally {
        saveBtn.disabled = false;
      }
    });
  }
  const eventData = {
    name: "Arduino Workshop",
    date: "12th October 2023",
    time: "9:00 am",
    registrations: 38,
    location: "SCIE Lab",
    registerBefore: "10th October, 11:59pm",
    requirements: ["Laptop", "Basic HTML Knowledge"],
    registrationLink: "https://docs.google.com/forms/u/0/",
  };
  displayEvent(eventData);
});
