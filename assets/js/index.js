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
    const imgHtml = event.imageUrl ? `<img src="${event.imageUrl}" class="event-card-img" alt="${event.name}">` : '';
    const descHtml = event.desc ? `<p class="event-card-desc">${event.desc}</p>` : '';

    return `
    <div class="col-lg-4 mt-4" data-aos="fade-up" data-aos-delay="100">
        <div class="box featured event-card-modern">
            ${imgHtml}
            <div class="event-card-content">
                <h2 class="event-title">${event.name}</h2>
                <div class="event-date-badge">
                   <i class="bi bi-calendar-event"></i> ${event.startdate} ${event.enddate ? ' - ' + event.enddate : ''}
                </div>
                ${descHtml}
                <div class="event-details-list">
                    <div class="detail-item">
                        <i class="bi bi-geo-alt"></i>
                        <span>${event.local}</span>
                    </div>
                    <div class="detail-item">
                        <i class="bi bi-clock"></i>
                        <span>${event.time} to ${event.timet}</span>
                    </div>
                    <div class="detail-item">
                        <i class="bi bi-alarm"></i>
                        <span>Deadline: ${event.lastedate}</span>
                    </div>
                </div>
                <div class="event-requirements">
                    <strong>Requirements:</strong>
                    <p>${event.reqirments}</p>
                </div>
                <a href="${event.link}" class="buy-btn" target="_blank">Register Now</a>
            </div>
        </div>
    </div>
 `;
  } else {
    return ``;
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
