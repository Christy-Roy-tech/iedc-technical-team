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

var collapse = "collapse";
var count = 1;

auth.onAuthStateChanged((user) => {
  if (user) {
    const userEmail = user.email;
    usersCollection.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        function displayEvent() {
          const eventContainer = document.getElementById("accordionExample");
          const eventDiv = document.createElement("div");

          if (doc.data().orderstatus === "open") {
            eventDiv.innerHTML = `
            <!-- ../... (your existing HTML code) ../... -->
            <div class="accordion-item mt-3">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                  data-bs-target="#${
                    collapse + count
                  }" aria-expanded="false" aria-controls="${collapse + count}">
                  
                  <div class="row  align-items-center">
                    
  
                    <div class="col-auto">
                      <p class="fs-4 fw-medium mb-3">${
                        doc.data().productname
                      }</p>
                      <p class="fw-light">${doc.data().dateandtime}</p>
                      <p class="text-success">Order is open</p>
                    </div>
                  </div>
                </button>
              </h2>
              
              <div id="${
                collapse + count
              }" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                  <ul>
                    <li><strong>Due date:</strong> 22/10/2023</li>
                    <li><strong>Name:</strong> ${doc.data().productname}</li>
                    <li><strong>Phone No:</strong> ${doc.data().phno}</li>
                    <li><strong>Email:</strong> ${doc.data().email}</li>
                    <li><strong>Address:</strong> ${doc.data().address}</li>
                    <li><strong>Order description:</strong> ${
                      doc.data().discription
                    } </li>                                 
                    <li class="mt-2">
                      <form>
                        <input style="display:none" id="demo" type="text" value="${
                          doc.id
                        }">
                        <div class="row d-flex justify-contents-start">
                          <div class="col-sm-2">
                            <strong>Amount:</strong> 
                          </div>
                          <div class="col">
                            <input type="text" id="price" class="form-control" placeholder="Enter amount" value="${
                              doc.data().price
                            }">
                          </div>
                          <div class="col">
                            <button class="btn btn-info" id="updateprice" data-orderid="${
                              doc.id
                            }">Update Amount</button>
                          </div>
                          <div class="col mt-2 mt-lg-0 d-flex justify-content-end">
                            <button class="btn btn-danger" id="orderclose" data-orderid="${
                              doc.id
                            }">Close Order</button>
                          </div>
                        </div>
                      </form>
                    </li>
                    <p class="text-danger"><small> Close Order only after updating amount. </small></p>
                  </ul>
                </div>
              </div>
            </div> `;

            count = count + 1;

            eventContainer.appendChild(eventDiv);

            const closeButton = eventDiv.querySelector("#orderclose");
            const priceUpdate = eventDiv.querySelector("#updateprice");

            closeButton.addEventListener("click", function (e) {
              e.preventDefault();
              const orderid = closeButton.getAttribute("data-orderid");
              orderclose(orderid);
            });

            priceUpdate.addEventListener("click", function (e) {
              e.preventDefault();
              const orderid = closeButton.getAttribute("data-orderid");
              updatePrice(orderid);
            });
          }
        }

        displayEvent();
      });
    });

    const firestore = firebase.firestore();

    function updatePrice(orderid) {
      const orderRef = firestore.collection("Orders").doc(orderid);
      var price = document.getElementById("price").value;
      orderRef
        .update({
          price: price,
        })
        .then(() => {
          console.log("Price updated successfully.");
        })
        .catch((error) => {
          console.error(`Error updating in order ${orderid}: `, error);
        });
      Swal.fire({
        title: "Success",
        text: "Price successfully updated",
        icon: "success",
        confirmButtonText: "continue",
      });
      setTimeout(function () {
        window.location.reload();
      }, 2000);
    }

    function orderclose(orderid) {
      const orderRef = firestore.collection("Orders").doc(orderid);
      // var price = document.getElementById("price").value;
      orderRef
        .update({
          orderstatus: "closed",
          // price: price,
        })
        .then(() => {
          Swal.fire({
            title: "Success",
            text: "Order successfully closed",
            icon: "success",
            confirmButtonText: "continue",
          });
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error(`Error closing order ${orderid}: `, error);
        });
    }

    usersCollection
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          displayEvent(doc);
        });
      })
      .catch((error) => {
        console.error("Error querying documents: ", error);
      });
  }
});
searchItem.addEventListener("change", (e) => {
  searchAndScroll();
  function searchAndScroll() {
    const searchItem = document
      .getElementById("searchItem")
      .value.toLowerCase();
    const itemContainer = document.getElementById("accordionExample");
    const items = itemContainer.getElementsByClassName(
      "accordion-button collapsed"
    );

    let itemFound = false;

    for (let i = 0; i < items.length; i++) {
      const itemName = items[i].textContent.toLowerCase();

      if (itemName.includes(searchItem)) {
        // Scroll to the item
        items[i].scrollIntoView({ behavior: "smooth" });

        // Optionally, highlight the found item
        items[i].style.color = "green";

        itemFound = true;
        break; // Stop searching once the first match is found
      }
    }

    if (!itemFound) {
      alert("Item not found.");
    }
  }
});
