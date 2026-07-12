import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import {
  getFirestore,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";
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
              location.href = "./login.html";
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
      location.href = "./login.html";
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
          location.href = "./login.html";
        })
        .catch((error) => {});
    });
  }
}
