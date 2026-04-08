const _0x14238e = _0x264c;
(function (_0x41d77e, _0x59bee7) {
  const _0x8c7451 = _0x264c,
    _0x54224a = _0x41d77e();
  while (!![]) {
    try {
      const _0x36d6d8 =
        (parseInt(_0x8c7451(0x157)) / 0x1) *
          (-parseInt(_0x8c7451(0x134)) / 0x2) +
        parseInt(_0x8c7451(0x146)) / 0x3 +
        (parseInt(_0x8c7451(0x148)) / 0x4) *
          (-parseInt(_0x8c7451(0x147)) / 0x5) +
        (-parseInt(_0x8c7451(0x15c)) / 0x6) *
          (parseInt(_0x8c7451(0x132)) / 0x7) +
        (-parseInt(_0x8c7451(0x13d)) / 0x8) *
          (parseInt(_0x8c7451(0x14d)) / 0x9) +
        -parseInt(_0x8c7451(0x149)) / 0xa +
        (-parseInt(_0x8c7451(0x130)) / 0xb) *
          (-parseInt(_0x8c7451(0x13c)) / 0xc);
      if (_0x36d6d8 === _0x59bee7) break;
      else _0x54224a["push"](_0x54224a["shift"]());
    } catch (_0x593a95) {
      _0x54224a["push"](_0x54224a["shift"]());
    }
  }
})(_0x2c53, 0xbdef4);
import { firebaseConfig } from "./firebase.js";
function _0x264c(_0x2dd396, _0x14a58b) {
  const _0x2c53ab = _0x2c53();
  return (
    (_0x264c = function (_0x264c51, _0xd7fa30) {
      _0x264c51 = _0x264c51 - 0x130;
      let _0x36e488 = _0x2c53ab[_0x264c51];
      return _0x36e488;
    }),
    _0x264c(_0x2dd396, _0x14a58b)
  );
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
function _0x2c53() {
  const _0x12364b = [
    "6582WiaESI",
    "16502926qugZqs",
    "getElementById",
    "1442qTFPQQ",
    "You\x20have\x20successfully\x20Created\x20New\x20Account",
    "482098UIwZIS",
    "innerHTML",
    "success",
    "mixin",
    "Please\x20Check\x20Your\x20Email",
    "resumeTimer",
    "catch",
    "stopTimer",
    "24XXJxzo",
    "1479512QWlwBj",
    "email2",
    "password\x20doesnot\x20match",
    "user",
    "message",
    "./admin/admin.html",
    "value",
    "mouseenter",
    "code",
    "2839086ezvZqx",
    "5KthyuK",
    "3036932VdgMWU",
    "1659870EKJOIT",
    "Firebase:\x20Error\x20(auth/invalid-email).",
    "mouseleave",
    "Firebase:\x20Error\x20(auth/invalid-login-credentials).",
    "63wMvimN",
    "Password\x20should\x20be\x20at\x20least\x206\x20characters",
    "login_failed2",
    "email1",
    "then",
    "href",
    "Firebase:\x20Error\x20(auth/email-already-in-use).",
    "preventDefault",
    "./user/user-dashboard.html",
    "click",
    "3MVmDjv",
    "Firebase:\x20Password\x20should\x20be\x20at\x20least\x206\x20characters\x20(auth/weak-password).",
    "top-end",
    "fire",
    "addEventListener",
  ];
  _0x2c53 = function () {
    return _0x12364b;
  };
  return _0x2c53();
}
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
const app = initializeApp(firebaseConfig),
  analytics = getAnalytics(app),
  auth = getAuth();
login[_0x14238e(0x15b)]("click", (_0x41f9aa) => {
  const _0x29ff43 = _0x14238e;
  _0x41f9aa[_0x29ff43(0x154)]();
  var _0x359af0 = document[_0x29ff43(0x131)](_0x29ff43(0x13e))["value"],
    _0x5d73e1 = document["getElementById"]("pass2")[_0x29ff43(0x143)];
  signInWithEmailAndPassword(auth, _0x359af0, _0x5d73e1)
    [_0x29ff43(0x151)]((_0x59a7c5) => {
      const _0x2ad109 = _0x29ff43,
        _0x30269f = _0x59a7c5[_0x2ad109(0x140)];
      _0x25a12e();
      function _0x25a12e() {
        const _0x26c3d7 = _0x2ad109;
        setTimeout(function () {
          const _0xe239ec = _0x264c;
          _0x359af0 == "webmasteriedc@gmail.com"
            ? (location[_0xe239ec(0x152)] = _0xe239ec(0x142))
            : (location["href"] = "./user/user-dashboard.html");
        }, 0x7d0);
        const _0x24973d = Swal["mixin"]({
          toast: !![],
          position: _0x26c3d7(0x159),
          showConfirmButton: ![],
          timer: 0xbb8,
          timerProgressBar: !![],
          didOpen: (_0x22d865) => {
            const _0x87fb55 = _0x26c3d7;
            _0x22d865[_0x87fb55(0x15b)](
              _0x87fb55(0x144),
              Swal[_0x87fb55(0x13b)]
            ),
              _0x22d865["addEventListener"](
                _0x87fb55(0x14b),
                Swal[_0x87fb55(0x139)]
              );
          },
        });
        _0x24973d[_0x26c3d7(0x15a)]({
          icon: _0x26c3d7(0x136),
          title: "Signed\x20in\x20successfully",
        });
      }
    })
    [_0x29ff43(0x13a)]((_0x171987) => {
      const _0x29315f = _0x29ff43,
        _0x3476c2 = _0x171987[_0x29315f(0x145)],
        _0x1a900e = _0x171987[_0x29315f(0x141)];
      var _0xd6c15e = ![];
      if (_0xd6c15e == ![]) {
        if (_0x1a900e == _0x29315f(0x14a))
          document[_0x29315f(0x131)]("login_failed")[_0x29315f(0x135)] =
            _0x29315f(0x138);
        else {
          if (_0x1a900e == _0x29315f(0x14c))
            document[_0x29315f(0x131)]("login_failed")[_0x29315f(0x135)] =
              "Please\x20Check\x20Your\x20Password";
        }
      }
    });
}),
  submit["addEventListener"](_0x14238e(0x156), (_0xc05b53) => {
    const _0x29a5b0 = _0x14238e;
    _0xc05b53[_0x29a5b0(0x154)]();
    var _0x47d504 = document[_0x29a5b0(0x131)](_0x29a5b0(0x150))[
        _0x29a5b0(0x143)
      ],
      _0x405903 = document[_0x29a5b0(0x131)]("pass1")[_0x29a5b0(0x143)],
      _0x29986c = document["getElementById"]("pass3")[_0x29a5b0(0x143)];
    _0x405903 != _0x29986c
      ? (document["getElementById"](_0x29a5b0(0x14f))[_0x29a5b0(0x135)] =
          _0x29a5b0(0x13f))
      : createUserWithEmailAndPassword(auth, _0x47d504, _0x405903)
          ["then"]((_0x239bea) => {
            const _0x4d3f7f = _0x239bea["user"];
            function _0x338418() {
              const _0x599909 = _0x264c;
              setTimeout(function () {
                const _0x5e4efd = _0x264c;
                location[_0x5e4efd(0x152)] = _0x5e4efd(0x155);
              }, 0x7d0);
              const _0x3dc461 = Swal[_0x599909(0x137)]({
                toast: !![],
                position: _0x599909(0x159),
                showConfirmButton: ![],
                timer: 0xbb8,
                timerProgressBar: !![],
                didOpen: (_0x1f6139) => {
                  const _0x2a2b6d = _0x599909;
                  _0x1f6139["addEventListener"](
                    _0x2a2b6d(0x144),
                    Swal[_0x2a2b6d(0x13b)]
                  ),
                    _0x1f6139[_0x2a2b6d(0x15b)](
                      "mouseleave",
                      Swal[_0x2a2b6d(0x139)]
                    );
                },
              });
              _0x3dc461[_0x599909(0x15a)]({
                icon: _0x599909(0x136),
                title: _0x599909(0x133),
              });
            }
            _0x338418();
          })
          [_0x29a5b0(0x13a)]((_0x371d70) => {
            const _0xb84e12 = _0x29a5b0,
              _0x45e4a4 = _0x371d70[_0xb84e12(0x145)],
              _0x840d97 = _0x371d70[_0xb84e12(0x141)];
            var _0x1b7a2d = ![];
            if (_0x1b7a2d == ![]) {
              if (_0x840d97 == _0xb84e12(0x158))
                document["getElementById"](_0xb84e12(0x14f))[_0xb84e12(0x135)] =
                  _0xb84e12(0x14e);
              if (_0x840d97 == _0xb84e12(0x153))
                document[_0xb84e12(0x131)]("login_failed2")["innerHTML"] =
                  "email-already-in-use";
            }
          });
  });
