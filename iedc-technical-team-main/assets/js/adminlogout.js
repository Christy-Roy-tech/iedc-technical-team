import { firebaseConfig } from "./firebase.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
  } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const SignOutBtn = document.getElementById("SignOut");
if (SignOutBtn) {
  SignOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        location.href = "../../pages/login.html";
      })
      .catch((error) => {});
  });
}