document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".wrapper");
  const loginLink = document.querySelector(".login-link");
  const registerLink = document.querySelector(".register-link");
  const iconClose = document.querySelector(".icon-close");

  if (wrapper) wrapper.classList.add("active-popup");

  if (registerLink && wrapper) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      wrapper.classList.add("active");
    });
  }

  if (loginLink && wrapper) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      wrapper.classList.remove("active");
    });
  }

  if (iconClose) {
    iconClose.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }

  function showPassFun(x, showPassBtn) {
    if (!x || !showPassBtn) return;
    if (x.type === "password") {
      x.type = "text";
      showPassBtn.setAttribute("name", "eye");
    } else {
      x.type = "password";
      showPassBtn.setAttribute("name", "eye-off");
    }
  }

  var showPassBtn1 = document.getElementById("showpass1");
  var showPassBtn2 = document.getElementById("showpass2");
  var showPassBtn3 = document.getElementById("showpass3");

  if (showPassBtn1) {
    showPassBtn1.onclick = function () {
      showPassFun(document.getElementById("pass1"), showPassBtn1);
    };
  }
  if (showPassBtn2) {
    showPassBtn2.onclick = function () {
      showPassFun(document.getElementById("pass2"), showPassBtn2);
    };
  }
  if (showPassBtn3) {
    showPassBtn3.onclick = function () {
      showPassFun(document.getElementById("pass3"), showPassBtn3);
    };
  }
});