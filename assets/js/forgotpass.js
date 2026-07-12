import { firebaseConfig } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import {
  getAuth,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

forgot.addEventListener("click", (e) => {
  e.preventDefault();
  var email = document.getElementById("email").value;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Password reset email sent!
      // ..
      Swal.fire({
        title: "success",
        text: "password reset email send successfully and please check you email",
        icon: "success",
        confirmButtonText: "continue",
      });
      setTimeout(function () {
        window.location.reload();
        location.href = "./login.html";
      }, 2000);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
});
