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
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const querySnapshot = await getDocs(collection(db, "Events"));
var dropdown = document.getElementById("dropdown");
const querySnapshot1 = await getDocs(collection(db, "Events"));
var dropdown1 = document.getElementById("dropdown1");
const querySnapshot2 = await getDocs(collection(db, "Events"));
var dropdown2 = document.getElementById("dropdown2");
querySnapshot.forEach((docc) => {
  function displayEvent(eventData) {
    var option = document.createElement("option");
    option.value = docc.id;
    option.text = docc.data().name;
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
  submit2.addEventListener("click", (e) => {
    e.preventDefault();
    var selectedValue = dropdown.value;
    if (docc.data().name == selectedValue) {
      async function deleteCityDocument() {
        try {
          const cityDocRef = doc(db, "Events", selectedValue);
          await deleteDoc(cityDocRef);
          Swal.fire({
            title: "success",
            text: "event sucessfully removed",
            icon: "success",
            confirmButtonText: "continue",
          });
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error("Error removing document: ", error);
        }
      }

      deleteCityDocument();
    }
   
  });
  function displayEvent1(eventData) {
    var option = document.createElement("option");
    option.value = docc.id;
    if (docc.data().flag === "active") {
      option.text = docc.data().name;
      dropdown1.appendChild(option);
    }
  }
  displayEvent1(eventData);
  submit3.addEventListener("click", (e) => {
    e.preventDefault();
    var selectedValue1 = dropdown1.value;
    if (docc.data().name == selectedValue1) {
      async function deleteCityDocument() {
        const docRef = doc(db, "Events", selectedValue1);
        const data = {
          flag: "false",
        };
        updateDoc(docRef, data).then((docRef) => {
          Swal.fire({
            title: "success",
            text: "event sucessfully deactivated",
            icon: "success",
            confirmButtonText: "continue",
          });
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        });
      }

      deleteCityDocument();
    }
  
  });
  function displayEvent2(eventData) {
    var option = document.createElement("option");
    option.value = docc.id;
    if (docc.data().flag === "false") {
      option.text = docc.data().name;
      dropdown2.appendChild(option);
    }
  }
  displayEvent2(eventData);
  submit4.addEventListener("click", (e) => {
    e.preventDefault();
    var selectedValue2 = dropdown2.value;
    if (docc.data().name == selectedValue2) {
      async function deleteCityDocument() {
        const docRef = doc(db, "Events", selectedValue2);
        const data = {
          flag: "active",
        };
        updateDoc(docRef, data).then((docRef) => {
            Swal.fire({
                title: "success",
                text: "event sucessfully activated",
                icon: "success",
                confirmButtonText: "continue",
              });
              setTimeout(function () {
                window.location.reload();
              }, 2000);
         
        });
      }

      deleteCityDocument();
    }
   
  });
});