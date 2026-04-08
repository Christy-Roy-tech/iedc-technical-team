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
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    addSignoutButton();

    function addSignoutButton() {
      var SignOutContainer = document.getElementById("SignOutContainer");
      if (SignOutContainer) {
        var SignOut = document.createElement("a");
        SignOut.id = "SignOut";
        SignOut.className = "getstarted";
        SignOut.innerText = "SignOut";
        SignOutContainer.appendChild(SignOut);

        SignOut.addEventListener("click", (e) => {
          e.preventDefault();
          signOut(auth)
            .then(() => {
              location.href = "./pages/login.html";
            })
            .catch((error) => {});
        });
      }
    }
  } else {
    document.getElementById("Dashboard").style.display = "none"; //new line for dynamiccally display the my dashboard
    addLoginButton();
  }
});
function addLoginButton() {
  var loginButtonContainer = document.getElementById("loginButtonContainer");
  if (loginButtonContainer) {
    var loginButton = document.createElement("a");
    loginButton.id = "loginButton";
    loginButton.className = "getstarted";
    loginButton.innerText = "Login";
    loginButtonContainer.appendChild(loginButton);

    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      location.href = "./pages/login.html";
    });
  }
}
function addSignoutButton() {
  var loginButtonContainer = document.getElementById("loginButtonContainer");
  if (loginButtonContainer) {
    var loginButton = document.createElement("a");
    loginButton.id = "loginButton";
    loginButton.className = "getstarted";
    loginButton.innerText = "SignOut";
    loginButtonContainer.appendChild(loginButton);
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          location.href = "./pages/login.html";
        })
        .catch((error) => {});
    });
  }
}
const collectionName = "events";
function createEventCard(event) {
  if (event.flag == "active") {
    return `
    <div class="col-lg-4 mt-3" data-aos="fade-up" data-aos-delay="100">
        <div class="box featured">
            <h1 class="fs-1">${event.name}</h1>
            <h3><span>${event.startdate}  ${event.enddate} </span></h3>
            <ul>
                <li><i class="bx bx-check"></i><span>Location:</span> ${event.local}</li>
                <li><i class="bx bx-check"></i><span>Time:</span> ${event.time} to ${event.timet}</li>
                <li><i class="bx bx-check"></i><span>Register before:</span> ${event.lastedate}</li>
                <li>
                    <i class="bx bx-check"></i><span>Requirements:</span> <br><br>
                    <p>${event.reqirments}</p>
                </li>
            </ul>
            <a href="${event.link}" class="buy-btn">Register</a>
        </div>
    </div>
`;
  } else {
    return `
    <div style="display:none" class="col-lg-4" data-aos="fade-up" data-aos-delay="100">
        
    </div>
`;
  }
}
function displayEvents(events) {
  const eventCardsContainer = document.getElementById("event-cards");
  eventCardsContainer.innerHTML = "";

  events.forEach((event) => {
    const eventCardHTML = createEventCard(event);
    eventCardsContainer.innerHTML += eventCardHTML;
  });
}
const querySnapshot = await getDocs(collection(db, "Events"));
const events = [];
querySnapshot.forEach((doc) => {
  events.push(doc.data());
});
displayEvents(events);
