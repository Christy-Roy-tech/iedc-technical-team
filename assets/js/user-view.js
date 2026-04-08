import { firebaseConfig } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    document.getElementById("dashboarduser").innerHTML = user.email;
    addSignoutButton();
    submit.addEventListener("click", (e) => {
      e.preventDefault();
      async function hello() {
        const collectionName = "events";
        var email = user.email;
        var fname = document.getElementById("fname").value;
        var lname = document.getElementById("lname").value;
        var address = document.getElementById("address").value;
        var pname = document.getElementById("pname").value;
        var phno = document.getElementById("phno").value;
        var pof = document.getElementById("pof").value;
        var date = document.getElementById("date").value;
        var ddate = document.getElementById("ddate").value;
        var strength = document.querySelector(
          'input[name="strength"]:checked'
        ).value;
        var addinfo = document.querySelector(
          'input[name="addinfo"]:checked'
        ).value;
        var affiliation = document.querySelector(
          'input[name="affiliation"]:checked'
        ).value;

        await setDoc(doc(db, "Orders", email), {
          firstname: fname,
          lname: lname,
          address: address,
          phno: phno,
          purposeofproduct: pof,
          productname: pname,
          date: date,
          deliverydate: ddate,
          strength: strength,
          addinfo: addinfo,
          affiliation: affiliation,
          email: email,
        });
      }
      hello();
      Swal.fire({
        title: "success",
        text: "order successfully placed",
        icon: "success",
        confirmButtonText: "continue",
      });
      setTimeout(function () {
        window.location.reload();
      }, 2000);
    });
  }
});
function addSignOut() {
  var SignOutContainer = document.getElementById("SignOutContainer");
  if (SignOutContainer) {
    var SignOut = document.createElement("button");
    SignOut.id = "SignOut";
    SignOut.className = "btn";
    SignOut.innerText = "Login";
    SignOutContainer.appendChild(SignOut);

    SignOut.addEventListener("click", (e) => {
      e.preventDefault();
      location.href = "login.html";
    });
  }
}
function addSignoutButton() {
  var SignOutContainer = document.getElementById("SignOutContainer");
  if (SignOutContainer) {
    var SignOut = document.createElement("button");
    SignOut.id = "SignOut";
    SignOut.className = "btn ";
    SignOut.innerText = "SignOut";
    SignOutContainer.appendChild(SignOut);

    SignOut.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          location.href = "login.html";
        })
        .catch((error) => {});
    });
  }
}
const querySnapshot = await getDocs(collection(db, "Orders"));
querySnapshot.forEach((doc) => {
  function displayEvent() {
    const eventContainer = document.getElementById("orders");
    const eventDiv = document.createElement("div");
    eventDiv.className = "row order-header ps-3 pe-3";
    eventDiv.innerHTML = `
                <div class="row order-header ps-3 pe-3">
              <div class="col-4 pt-3">
                <p class="mb-0">Order placed</p>
                <p class="fw-medium">${doc.data().date}</p>
              </div>

              <div class="col-4 pt-3">
                <p class="mb-0">Delivery recieved</p>
                <p class="fw-medium">${doc.data().deliverydate}</p>
              </div>

              <div class="col-2 pt-3">
                <p class="mb-0">Amount</p>
                <p class="fw-medium">₹1500</p>
              </div>

              <div class="col-2 pt-3">
                <p>Order # <span class="fw-medium">27635</span></p>
              </div>
            </div>

            <div class="row align-items-center p-3 order-content">
              <div class="col-lg-2 align-content-center">
                <img src="../assets/img/3d-model/3d-printed-gear.png" alt="" class="img-fluid" />
              </div>

              <div class="col-lg-8 mt-3 mt-lg-0">
                <!-- This must be product name-->
                <p class="fs-4 fw-medium mb-1">${doc.data().productname}</p>
                <p class="fw-light">Other info if any</p>
    `;
    eventContainer.appendChild(eventDiv);
  }

  displayEvent();
});
