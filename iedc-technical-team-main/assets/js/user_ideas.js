import { firebaseConfig } from "./firebase.js";

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
const usersCollection = db.collection("ideas");
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  submit.addEventListener("click", (e) => {
    e.preventDefault();
    var fname = document.getElementById("fname").value;
    var lname = document.getElementById("lname").value;
    var email = document.getElementById("email").value;
    var phno = document.getElementById("phno").value;
    var year = document.getElementById("year").value;
    var branch = document.getElementById("branch").value;
    var ideatitle = document.getElementById("ideatitle").value;
    var description = document.getElementById("description").value;
    var timestamp = document.getElementById("dateandtime").value;
    var insights = document.getElementById("insights").value;
    if (
      (fname &&
        lname &&
        email &&
        phno &&
        year &&
        branch &&
        ideatitle &&
        description &&
        insights) === ""
    ) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: "error",
        title: "please fill all the fields",
      });
    } else if (phno.length != "10") {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      Toast.fire({
        icon: "error",
        title: "phone number must a 10 digit number",
      });
    } else {
      db.collection("ideas")
        .add({
          firstname: fname,
          lname: lname,
          email: email,
          ideatitle: ideatitle,
          phno: phno,
          year: year,
          branch: branch,
          description: description,
          timestamp: timestamp,
          insights: insights,
        })
        .then((docRef) => {
          Swal.fire({
            title: "success",
            text: "order successfully placed",
            icon: "success",
            confirmButtonText: "continue",
          });
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.log("Error adding document: ", error);
        })
        .catch((error) => {
          alert("Error getting documents: ", error);
        });
    }
  });
});
