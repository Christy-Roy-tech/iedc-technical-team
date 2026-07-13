import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import {
  getFirestore,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase.js";
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to format any date string to YYYY-MM-DD for date input elements
function toISODate(dateStr) {
  if (!dateStr) return "";
  dateStr = dateStr.trim();
  if (dateStr.toLowerCase().startsWith("to ")) {
    dateStr = dateStr.substring(3).trim();
  }
  
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  // Try parsing text like "12th October 2023"
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const fullMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  
  let lower = dateStr.toLowerCase();
  let yearMatch = lower.match(/\b(20\d{2})\b/);
  let year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  
  let month = -1;
  for (let i = 0; i < 12; i++) {
    if (lower.includes(fullMonths[i]) || lower.includes(months[i])) {
      month = i;
      break;
    }
  }
  
  let dayMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  let day = 1;
  if (dayMatch) {
    day = parseInt(dayMatch[1]);
  }
  
  if (month !== -1) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }
  
  let parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  
  return "";
}
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
    console.warn("Cloudinary upload failed in event edit, trying ImgBB...", err);
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
  var sdate = document.getElementById("sdate").value;
  var time = document.getElementById("time").value;
  var edate = document.getElementById("edate").value;
  var timeto = document.getElementById("timeto").value;
  var url = document.getElementById("url").value;
  var ldate = document.getElementById("ldate").value;
  var location = document.getElementById("location").value;
  var req = document.getElementById("req").value;
  var namme = document.getElementById("namme").value;
  if (!namme) {
    Swal.fire({ title: "Error", text: "No event selected", icon: "error" });
    return;
  }
  submit.disabled = true;
  submit.innerText = "Updating...";

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

  const docRef = doc(db, "Events", namme);
  const data = {
    name: eventname,
    startdate: sdate,
    time: time,
    enddate: edate,
    timet: timeto,
    link: url,
    lastedate: ldate,
    local: location,
    reqirments: req,
  };
  if (imageUrl !== "") {
    data.imageUrl = imageUrl;
  }

  try {
    await updateDoc(docRef, data);
    Swal.fire({
      title: "Success",
      text: "Event successfully updated!",
      icon: "success",
      confirmButtonText: "Continue",
    });
    setTimeout(function () {
      window.location.reload();
    }, 2000);
  } catch (err) {
    console.error("Error updating event:", err);
    Swal.fire({ title: "Error", text: "Failed to update event", icon: "error" });
    submit.disabled = false;
    submit.innerText = "Update";
  }
});
const querySnapshot = await getDocs(collection(db, "Events"));
var dropdown = document.getElementById("dropdown");
querySnapshot.forEach((doc) => {
  function displayEvent(eventData) {
    var option = document.createElement("option");
    option.value = doc.id;
    option.text = doc.data().name;
    dropdown.appendChild(option);
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
  dropdown.addEventListener("change", (e) => {
    e.preventDefault();
    var selectedValue = dropdown.value;
    document.getElementById("namme").value = selectedValue;
    if (doc.id == selectedValue) {
      document.getElementById("eventname").value = doc.data().name;
      document.getElementById("sdate").value = toISODate(doc.data().startdate);
      document.getElementById("time").value = doc.data().time;
      document.getElementById("edate").value = toISODate(doc.data().enddate);
      document.getElementById("timeto").value = doc.data().timet;
      document.getElementById("url").value = doc.data().link;
      document.getElementById("ldate").value = doc.data().lastedate;
      document.getElementById("location").value = doc.data().local;
      document.getElementById("req").value = doc.data().reqirments;
      if (document.getElementById("imgurl")) {
        document.getElementById("imgurl").value = doc.data().imageUrl || "";
      }
      if (document.getElementById("imgpreview") && document.getElementById("imgpreview-tag")) {
        if (doc.data().imageUrl) {
          document.getElementById("imgpreview-tag").src = doc.data().imageUrl;
          document.getElementById("imgpreview").style.display = "block";
        } else {
          document.getElementById("imgpreview").style.display = "none";
        }
      }
    }
    $("#event-data").show();
    $("#filler").hide();
  });
});
