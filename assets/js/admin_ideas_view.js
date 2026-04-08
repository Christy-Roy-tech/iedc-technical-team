import { firebaseConfig } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ideasQuery = query(collection(db, "ideas"), orderBy("timestamp", "desc"));
const querySnapshot = await getDocs(ideasQuery);
let collapse = 'collapse';
let count = 1;
querySnapshot.forEach((doc) => {
  function displayEvent(eventData) {
    const eventContainer = document.getElementById("accordionFlushExample");
    const eventDiv = document.createElement("div");
    eventDiv.className = "accordion accordion-flush";
    eventDiv.innerHTML = `
      <div class="accordion-item" style="border:1px solid rgb(145 145 145 / 45%);border-radius: 8px;">
      <h2 class="accordion-header" style="border-radius: 5px;">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
      data-bs-target="#${collapse+count}" aria-expanded="false" aria-controls="${collapse+count}">
            ${doc.data().ideatitle} &emsp; | &emsp;<span>${doc.data().firstname} ${doc.data().lname}  </span> 
          </button>
      </h2>
      <div id="${collapse+count}" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
          
          <div class="accordion-body">
          <span style="color:red">${doc.data().timestamp}</span> 
              <ul class="idea-list">
                  <li>
                      Email: ${doc.data().email}
                  </li>
                  <li>
                      Phone: ${doc.data().phno}
                  </li>
                  <li>
                      Class: ${doc.data().year} ${doc.data().branch}
                  </li>
                  <li>
                      Description: <br>
                      ${doc.data().description}
                  </li>
                  <li>
                  Insights about the team and progress so far!: <br>
                  ${doc.data().insights}
              </li>
                  
              </ul>
          </div>
      </div>
  </div>
  </div>    
    `;
    count = count+1;

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
});
