import {firebaseConfig} from './firebase.js'
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  const usersCollection = db.collection("Orders");
  const auth = firebase.auth();


  auth.onAuthStateChanged((user) => {
    if (user) {

      const userEmail = user.email;
      document.getElementById('dashboarduser').innerHTML = userEmail
      usersCollection.where("email", "==", userEmail).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          function displayEvent() {
            const eventContainer = document.getElementById("orders");
            const eventDiv = document.createElement("div");
            eventDiv.className = "container items mb-4";
            eventDiv.innerHTML = `
            <div class="item">
                <div class="row order-header ps-3 pe-3">
                  <div class="col pt-3">
                    <p class="mb-0">Order placed</p>
                    <p class="fw-medium">${doc.data().dateandtime}</p>
                  </div>

                  <div class="col pt-3">
                    <p class="mb-0">Delivery recieved</p>
                    <p class="fw-medium">${doc.data().deliverydate}</p>
                  </div>
                  <div class="col pt-3">
                    <p class="mb-0">Order Status</p>
                    <p class="fw-medium">${doc.data().orderstatus}</p>
                  </div>
                  <div class="col pt-3">
                    <p class="mb-0">Order price</p>
                    <p class="fw-medium">${doc.data().price}</p>
                  </div>
                  <div class="col pt-3">
                    <p>Order-ID <span class="fw-medium">${doc.id}</span></p>
                  </div>
                </div>

                <div class="row align-items-center p-3 order-content">
                  <div class="mt-3 mt-lg-0">
                    <!-- This must be product name-->
                    <p class="fs-4 fw-medium mb-1">${doc.data().productname}</p>
                    <p class="fw-light">Purpose : ${doc.data().purposeofproduct} <br>Address : ${doc.data().address} <br>Email : ${doc.data().email} <br>Phno : ${doc.data().phno}</p>
                  </div>
                </div>
                </div>`;

            eventContainer.appendChild(eventDiv);
          }

          displayEvent()
        });
      })


    } else {
      console.log("No user is signed in.");
    }
  });
  searchItem.addEventListener('change',(e)=>{
    searchAndScroll()
    function searchAndScroll() {
            const searchItem = document.getElementById('searchItem').value.toLowerCase();
            const itemContainer = document.getElementById('orders');
            const items = itemContainer.getElementsByClassName('item');

            let itemFound = false;

            for (let i = 0; i < items.length; i++) {
                const itemName = items[i].textContent.toLowerCase();

                if (itemName.includes(searchItem)) {
                    // Scroll to the item
                    items[i].scrollIntoView({ behavior: 'smooth' });

                    // Optionally, highlight the found item
                    items[i].style.color= 'green';

                    itemFound = true;
                    break; // Stop searching once the first match is found
                }
            }

            if (!itemFound) {
                alert('Item not found.');
            }
        }
  })