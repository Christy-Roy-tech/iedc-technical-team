import { firebaseConfig } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import {
  getFirestore,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
submit.addEventListener("click", (e) => {
  e.preventDefault();
  async function hello() {
    const collectionName = "events";
    var to = "to";
    var eventname = document.getElementById("eventname").value;
    var sdate = document.getElementById("sdate").value;
    var time = document.getElementById("time").value;
    var edate = document.getElementById("edate").value;
    if (edate === "") var edate = document.getElementById("edate").value;
    else var edate = to + " " + document.getElementById("edate").value;

    var timeto = document.getElementById("timeto").value;
    if (timeto === "") var timeto = document.getElementById("timeto").value;
    else var timeto = to + " " + document.getElementById("timeto").value;
    var url = document.getElementById("url").value;
    var ldate = document.getElementById("ldate").value;
    var location = document.getElementById("location").value;
    var req = document.getElementById("req").value;

    await setDoc(doc(db, "Events", eventname), {
      name: eventname,
      startdate: sdate,
      time: time,
      enddate: edate,
      timet: timeto,
      link: url,
      lastedate: ldate,
      local: location,
      reqirments: req,
      flag: "active",
    });
  }
  hello();
  Swal.fire({
    title: "success",
    text: "event sucessfully added",
    icon: "success",
    confirmButtonText: "continue",
  });
  setTimeout(function () {
    window.location.reload();
  }, 2000);
});
const querySnapshot = await getDocs(collection(db, "Events"));
querySnapshot.forEach((doc) => {
  if (doc.data().flag === "active") {
    function displayEvent(eventData) {
      const eventContainer = document.getElementById("event-container");
      const eventDiv = document.createElement("div");
      eventDiv.className = "col-lg-6 col-12 events pt-4 mt-2 mt-lg-0";
      eventDiv.innerHTML = `
        <div class="event d-flex align-items-start">
            <div class="event-info">
                <h4 class="">${doc.data().name}</h4>
                <p><span>${doc.data().startdate} ${doc.data().enddate}, ${
        doc.data().time
      }</span></p>
                <p class="fw-semibold">Location : <span class="fw-normal">${
                  doc.data().local
                }</span></p>
                <p class="fw-semibold">Register before: <span class="fw-normal">${
                  doc.data().lastedate
                }</span></p>
                <p class="fw-semibold">Requirements: </p>
                <p> ${doc.data().reqirments}</p>
                <p class="fw-semibold">Link to register:<a href="${
                  doc.data().link
                }" target="_blank" class="fw-normal">${doc.data().link}</a></p>
                <div class="d-inline-flex gap-lg-3 gap-2 m-2">
                    <button class="btn btn-info">View Registrations</button>
                    
                </div>
            </div>
        </div>
    `;
      eventContainer.appendChild(eventDiv);
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
  } else {
    function displayEvent(eventData) {
      const eventContainer = document.getElementById("event-container1");
      const eventDiv = document.createElement("div");
      eventDiv.className = "col-lg-6 col-12 events pt-4 mt-2 mt-lg-0";
      eventDiv.innerHTML = `
        <div class="event d-flex align-items-start">
            <div class="event-info">
                <h4 class="">${doc.data().name}</h4>
                <p><span>${doc.data().startdate} ${doc.data().enddate}, ${
        doc.data().time
      }</span></p>
                <p class="fw-semibold">Location : <span class="fw-normal">${
                  doc.data().local
                }</span></p>
                <p class="fw-semibold">Register before: <span class="fw-normal">${
                  doc.data().lastedate
                }</span></p>
                <p class="fw-semibold">Requirements: </p>
                <p> ${doc.data().reqirments}</p>
                <p class="fw-semibold">Link to register:<a href="${
                  doc.data().link
                }" target="_blank" class="fw-normal">${doc.data().link}</a></p>
                <div class="d-inline-flex gap-lg-3 gap-2 m-2">
                    <button class="btn btn-info">View Registrations</button>
                    
                </div>
            </div>
        </div>
    `;
      eventContainer.appendChild(eventDiv);
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
  }
});
