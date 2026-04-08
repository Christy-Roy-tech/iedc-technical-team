(function (_0x140cd6, _0x18109d) {
  const _0x2b3bd4 = _0x261d,
    _0x19f80e = _0x140cd6();
  while (!![]) {
    try {
      const _0x54c0a6 =
        (-parseInt(_0x2b3bd4(0x7d)) / 0x1) * (parseInt(_0x2b3bd4(0x7e)) / 0x2) +
        parseInt(_0x2b3bd4(0x7f)) / 0x3 +
        (-parseInt(_0x2b3bd4(0x82)) / 0x4) * (parseInt(_0x2b3bd4(0x79)) / 0x5) +
        (parseInt(_0x2b3bd4(0x7b)) / 0x6) * (parseInt(_0x2b3bd4(0x78)) / 0x7) +
        (-parseInt(_0x2b3bd4(0x81)) / 0x8) *
          (-parseInt(_0x2b3bd4(0x76)) / 0x9) +
        -parseInt(_0x2b3bd4(0x73)) / 0xa +
        (-parseInt(_0x2b3bd4(0x7c)) / 0xb) * (parseInt(_0x2b3bd4(0x83)) / 0xc);
      if (_0x54c0a6 === _0x18109d) break;
      else _0x19f80e["push"](_0x19f80e["shift"]());
    } catch (_0x401eeb) {
      _0x19f80e["push"](_0x19f80e["shift"]());
    }
  }
})(_0x594f, 0x876ac);
function _0x261d(_0x34104a, _0x525e15) {
  const _0x594f5d = _0x594f();
  return (
    (_0x261d = function (_0x261d71, _0x23f646) {
      _0x261d71 = _0x261d71 - 0x73;
      let _0x8d58f8 = _0x594f5d[_0x261d71];
      return _0x8d58f8;
    }),
    _0x261d(_0x34104a, _0x525e15)
  );
}
function _0x594f() {
  const _0x4c79ba = [
    "435fPhFFA",
    "/pages/login.html",
    "3893406uvTMpo",
    "1035771KStNZN",
    "2wARcFU",
    "146308FRANsS",
    "42474piNuHF",
    "uid",
    "3287432DskzRo",
    "4000cjOsTF",
    "12mTAqJv",
    "replace",
    "6027800zqLLuM",
    "email",
    "location",
    "18TuCXlX",
    "You\x20must\x20be\x20logged\x20in\x20as\x20admin\x20to\x20access\x20admin\x20pages",
    "7AsSLEt",
  ];
  _0x594f = function () {
    return _0x4c79ba;
  };
  return _0x594f();
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { firebaseConfig } from "./firebase.js";
const app = initializeApp(firebaseConfig),
  auth = getAuth();
onAuthStateChanged(auth, (_0x2e112b) => {
  const _0x2ff328 = _0x261d;
  if (_0x2e112b) {
    const _0x15da09 = _0x2e112b[_0x2ff328(0x80)];
    _0x2e112b[_0x2ff328(0x74)] != "webmasteriedc@gmail.com" &&
      (window[_0x2ff328(0x75)][_0x2ff328(0x84)](_0x2ff328(0x7a)),
      alert(_0x2ff328(0x77)));
  } else
    alert(_0x2ff328(0x77)),
      window[_0x2ff328(0x75)][_0x2ff328(0x84)]("/pages/login.html");
});
