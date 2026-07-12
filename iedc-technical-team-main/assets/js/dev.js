var mainSection = document.getElementById('main-section');

// Head Part - main section
var backBtn = document.getElementById('back-btn');
var headText = document.getElementById('heading');
var hrMain = document.getElementById('hr-main');
var subHead = document.getElementById('sub-head');

// Single person section
var avtarImgNik = document.getElementById('avatar-img-nikhil');
var avtarImgPpp = document.getElementById('avatar-img-punnoose');
var avtarImgMid = document.getElementById('avatar-img-midhun');
var avtarImgJac = document.getElementById('avatar-img-jacob');
var avtarImgAkh = document.getElementById('avatar-img-akhil');

var singleSection; 
var singleImg;
var singleContent;
var closeBtn;

avtarImgNik.onclick = function () {
    singleSection = document.getElementById('single-person-nik');
    singleImg = document.getElementById('single-image-nik');
    singleContent = document.getElementById('single-content-nik');
    closeBtn = document.getElementById('close-btn-nik');

    startExec();
}

avtarImgPpp.onclick = function () {
    singleSection = document.getElementById('single-person-ppp');
    singleImg = document.getElementById('single-image-ppp');
    singleContent = document.getElementById('single-content-ppp');
    closeBtn = document.getElementById('close-btn-ppp');

    startExec();
}

avtarImgMid.onclick = function () {
    singleSection = document.getElementById('single-person-mid');
    singleImg = document.getElementById('single-image-mid');
    singleContent = document.getElementById('single-content-mid');
    closeBtn = document.getElementById('close-btn-mid');

    startExec();
}

avtarImgJac.onclick = function () {
    singleSection = document.getElementById('single-person-jac');
    singleImg = document.getElementById('single-image-jac');
    singleContent = document.getElementById('single-content-jac');
    closeBtn = document.getElementById('close-btn-jac');

    startExec();
}

avtarImgAkh.onclick = function () {
    singleSection = document.getElementById('single-person-akh');
    singleImg = document.getElementById('single-image-akh');
    singleContent = document.getElementById('single-content-akh');
    closeBtn = document.getElementById('close-btn-akh');

    startExec();
}


// --- Animations starts ---
function translateUp(element) {
    var elemHeight = element.offsetHeight;
    var distanceToTop = element.getBoundingClientRect().top + elemHeight;

    element.style.transform = 'translateY(-' + distanceToTop + 'px)';
}


// ------ Showing Single Person ------
function startExec() {

    // Removing items from main section
    $(avtarImgNik).fadeOut();
    $(avtarImgPpp).fadeOut();
    $(avtarImgMid).fadeOut();
    $(avtarImgJac).fadeOut();
    $(avtarImgAkh).fadeOut();

    translateUp(backBtn);
    translateUp(headText);
    translateUp(hrMain);
    translateUp(subHead);

    // Popping up single-person section
    singleSection.classList.remove("inactive");

    closeBtn.classList.remove('aos-animate');
    singleImg.classList.remove('aos-animate');
    singleContent.classList.remove('aos-animate');

    setTimeout(function () {
        mainSection.style.background = 'linear-gradient(#301717, #6d2222)';

        singleContent.classList.add('aos-animate');
        singleImg.classList.add('aos-animate');

        closeBtn.style.transform = 'translateY(12vh)';
        closeBtn.classList.add('aos-animate');
    }, 250);
    // --------- end ------------

}

function closeFun() {
    closeBtn.classList.remove('aos-animate');
    closeBtn.style.transform = 'translateY(-12vh)';
    closeBtn.classList.add('aos-animate');

    singleImg.classList.remove('aos-animate');
    singleContent.classList.remove('aos-animate');

    backBtn.style.transform = 'translateY(0)';
    headText.style.transform = 'translateY(0)';
    hrMain.style.transform = 'translateY(0)';
    subHead.style.transform = 'translateY(0)';

    setTimeout(function () {
        singleSection.classList.add('inactive');
    }, 700);

    setTimeout(function () {
        mainSection.style.background = 'linear-gradient(#171e30, #22346d)';

        $(avtarImgNik).fadeIn(1200);
        $(avtarImgPpp).fadeIn(1200);
        $(avtarImgMid).fadeIn(1200);
        $(avtarImgJac).fadeIn(1200);
        $(avtarImgAkh).fadeIn(1200);
    }, 250);

}

