const wrapper = document.querySelector(".wrapper");
const loginLink = document.querySelector(".login-link");
const registerLink = document.querySelector(".register-link");
const btnPopup = document.querySelector(".btnLogin-popup");
const iconClose = document.querySelector(".icon-close");

wrapper.classList.add("active-popup");

registerLink.addEventListener("click", () => {
  wrapper.classList.add("active");
});

loginLink.addEventListener("click", () => {
  wrapper.classList.remove("active");
});

iconClose.addEventListener("click", () => {
  window.location.href = "../index.html";
});

function showPassFun(x, showPassBtn) {
  if (x.type === "password") {
    x.type = "text";
    showPassBtn.setAttribute('name', 'eye');
  } else {
    x.type = "password";
    showPassBtn.setAttribute('name', 'eye-off');
  }
}

var showPassBtn1 = document.getElementById("showpass1");
var showPassBtn2 = document.getElementById("showpass2");
var showPassBtn3 = document.getElementById("showpass3");

showPassBtn1.onclick = function () {
  var x = document.getElementById("pass1");
  y = showPassBtn1;
  showPassFun(x, y);
}

showPassBtn2.onclick = function () {
  var x = document.getElementById("pass2");
  y = showPassBtn2;
  showPassFun(x, y);
}

showPassBtn3.onclick = function () {
  var x = document.getElementById("pass3");
  y = showPassBtn3;
  showPassFun(x, y);
}