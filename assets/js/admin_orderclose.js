const firebaseConfig = {
    apiKey: "AIzaSyAzKi2aLTMwgLwyj16w7Sp9YSpmtfEXuyQ",
    authDomain: "iedcsaintgits.firebaseapp.com",
    projectId: "iedcsaintgits",
    storageBucket: "iedcsaintgits.appspot.com",
    messagingSenderId: "316951208655",
    appId: "1:316951208655:web:135659271b8dc1aa5e8dba",
    measurementId: "G-8QR1CJEL4F",
  };
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  const usersCollection = db.collection("Orders");
  const auth = firebase.auth();

  var collapse = 'collapse';
  var count = 1;

  auth.onAuthStateChanged((user) => {
    if (user) {
      const userEmail = user.email;
      usersCollection.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          function displayEvent() {
            const eventContainer =
              document.getElementById("accordionExample");
            const eventDiv = document.createElement("div");
            // eventDiv.className = "accordion mt-4 order-list";

            if (doc.data().orderstatus == "closed") {
              eventDiv.innerHTML = `
              <!-- ../... (your existing HTML code) ../... -->
              <div class="accordion-item mt-3">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#${collapse+count}" aria-expanded="false" aria-controls="${collapse+count}">
                    
                    <div class="row  align-items-center">
                      
    
                      <div class="col-auto">
                        <p class="fs-4 fw-medium mb-3">${doc.data().productname}</p>
                        <p class="fw-light">${doc.data().dateandtime}</p>
                        <p class="text-danger">Order closed</p>
                      </div>
                    </div>
                  </button>
                </h2>
                
                <div id="${collapse+count}" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                  <div class="accordion-body">
                    <ul>
                      <li><strong>Due date:</strong> 22/10/2023</li>
                      <li><strong>Name:</strong> ${doc.data().productname}</li>
                      <li><strong>Phone No:</strong> ${doc.data().phno}</li>
                      <li><strong>Email:</strong> ${doc.data().email}</li>
                      <li><strong>Address:</strong> ${doc.data().address}</li>
                      <li><strong>Order description:</strong> ${doc.data().discription} </li>
                      <li><strong>Amount:</strong> ${doc.data().price} </li>
                    </ul>
                  </div>
                </div>
              </div>  `;

              count = count+1;
              eventContainer.appendChild(eventDiv);
            }
          }

          displayEvent();
        });
      });

      const firestore = firebase.firestore();

      usersCollection.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            displayEvent(doc);
          });
        })
        .catch((error) => {
          console.error("Error querying documents: ", error);
        });
    }
  });
  searchItem.addEventListener('change',(e)=>{
searchAndScroll()
function searchAndScroll() {
        const searchItem = document.getElementById('searchItem').value.toLowerCase();
        const itemContainer = document.getElementById('accordionExample');
        const items = itemContainer.getElementsByClassName('accordion-button');

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