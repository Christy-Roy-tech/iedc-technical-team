import { firebaseConfig } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

SignOut.addEventListener('click',(e)=>{
    e.preventDefault();
      signOut(auth)
        .then(() => {
          location.href = "../../pages/login.html";
        })
        .catch((error) => {});
  })