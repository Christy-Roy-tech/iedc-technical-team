
import {firebaseConfig} from './firebase.js'

  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  const usersCollection = db.collection("Orders");
  const auth = firebase.auth();


  auth.onAuthStateChanged((user) => {
    if (user) {

      const userEmail = user.email;
      submit.addEventListener('click', (e) => {
        e.preventDefault()
        var email = userEmail
        var fname = document.getElementById('fname').value;
        var lname = document.getElementById('lname').value;
        var address = document.getElementById('address').value;
        var pname = document.getElementById('pname').value;
        var phno = document.getElementById('phno').value;
        var pof = document.getElementById('pof').value;
        var ddate = document.getElementById('ddate').value
        var discription = document.getElementById('pd').value
        var dateandtime = document.getElementById('dateandtime').value
        if((fname&&lname&&address&&pname&&phno&&pof&&ddate&&discription)==="")
        {
          const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

Toast.fire({
  icon: 'error',
  title: 'please fill all the fields'
})

        }
else if(phno.length!='10'){
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  
  Toast.fire({
    icon: 'error',
    title: 'phone number must a 10 digit number'
  })
}
        else{
        var strength = document.querySelector('input[name="strength"]:checked').value;
        var addinfo = document.querySelector('input[name="addinfo"]:checked').value;
        var affiliation = document.querySelector('input[name="affiliation"]:checked').value;
          db.collection("Orders").add({
          firstname: fname,
          lname: lname,
          address: address,
          phno: phno,
          purposeofproduct: pof,
          productname: pname,
          deliverydate: ddate,
          strength: strength,
          addinfo: addinfo,
          affiliation: affiliation,
          email: email,
          discription: discription,
          orderstatus: 'open',
          price: " ",
          dateandtime: dateandtime
        })
          .then((docRef) => {
            Swal.fire({
                title: 'success',
                text: 'order successfully placed',
                icon: 'success',
                confirmButtonText: 'continue'
              })
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
        
      })
        
    } else {

      Swal.fire({     //// add this code to display alert to login before placing the order
        title: 'Login Required',
        text: 'Please log-in to place the order',
        icon: 'warning',
        confirmButtonText: 'Login Here'
      }).then((result)=> {
        location.href="../login.html";
      })
    }

  });