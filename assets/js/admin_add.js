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
const uploadToCloudinary = async (fileInput) => {
  if (!fileInput || !fileInput.files || !fileInput.files[0]) return null;
  const file = fileInput.files[0];

  // Tier 1: Try exact working Cloudinary setup (`dtz3a6oxn` + `iedc_uploads`)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "iedc_uploads");
    const res = await fetch("https://api.cloudinary.com/v1_1/dtz3a6oxn/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data && data.secure_url) return data.secure_url;
  } catch (err) {
    console.warn("Cloudinary upload failed in event add, trying ImgBB...", err);
  }

  // Tier 2: Try ImgBB (`api.imgbb.com/1/upload`)
  try {
    const imgbbKey = "371192ecce95dd54ec3de29ae55e7146";
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`https://api.imgbb.com/v1/upload?key=${imgbbKey}`, { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) return data.data.url;
    }
  } catch (e) {
    console.error("ImgBB and Cloudinary upload error:", e);
  }

  return null;
};

submit.addEventListener("click", async (e) => {
  e.preventDefault();
  var eventname = document.getElementById("eventname").value;
  if (!eventname) {
    Swal.fire({ title: "Error", text: "Please enter an event name", icon: "error" });
    return;
  }
  submit.disabled = true;
  submit.value = "Saving...";

  var to = "to";
  var sdate = document.getElementById("sdate").value;
  var time = document.getElementById("time").value;
  var edate = document.getElementById("edate").value;
  var timeto = document.getElementById("timeto").value;
  if (timeto === "") timeto = document.getElementById("timeto").value;
  else timeto = to + " " + document.getElementById("timeto").value;
  var url = document.getElementById("url").value;
  var ldate = document.getElementById("ldate").value;
  var location = document.getElementById("location").value;
  var req = document.getElementById("req").value;

  let imageUrl = "";
  const imgFileInput = document.getElementById("imgfile");
  const imgUrlInput = document.getElementById("imgurl");
  if (imgFileInput && imgFileInput.files && imgFileInput.files.length > 0) {
    const uploaded = await uploadToCloudinary(imgFileInput);
    if (uploaded) imageUrl = uploaded;
  }
  if (!imageUrl && imgUrlInput && imgUrlInput.value.trim() !== "") {
    imageUrl = imgUrlInput.value.trim();
  }

  try {
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
      imageUrl: imageUrl,
      flag: "active",
    });
    Swal.fire({
      title: "Success",
      text: "Event successfully added with photo!",
      icon: "success",
      confirmButtonText: "Continue",
    });
    setTimeout(function () {
      window.location.reload();
    }, 2000);
  } catch (err) {
    console.error("Error saving event:", err);
    Swal.fire({ title: "Error", text: "Failed to save event", icon: "error" });
    submit.disabled = false;
    submit.value = "Add event";
  }
});
const querySnapshot = await getDocs(collection(db, "Events"));
querySnapshot.forEach((doc) => {
  if (doc.data().flag === "active") {
    function displayEvent(eventData) {
      const eventContainer = document.getElementById("event-container");
      const eventDiv = document.createElement("div");
      eventDiv.className = "col-lg-6 col-12 events pt-4 mt-2 mt-lg-0";
      const imgUrl = doc.data().imageUrl;
      const imgHtml = imgUrl ? `<img src="${imgUrl}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" alt="${doc.data().name}">` : '';
      eventDiv.innerHTML = `
        <div class="event d-flex align-items-start">
            <div class="event-info" style="width: 100%;">
                ${imgHtml}
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
      const imgUrl = doc.data().imageUrl;
      const imgHtml = imgUrl ? `<img src="${imgUrl}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" alt="${doc.data().name}">` : '';
      eventDiv.innerHTML = `
        <div class="event d-flex align-items-start">
            <div class="event-info" style="width: 100%;">
                ${imgHtml}
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
