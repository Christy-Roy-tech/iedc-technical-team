import { firebaseConfig } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";
import {
  getFirestore,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    const dashBtn = document.getElementById("Dashboard");
    if (dashBtn) dashBtn.style.display = "";
    const uid = user.uid;
    addSignoutButton();

    function addSignoutButton() {
      var SignOutContainer = document.getElementById("SignOutContainer");
      if (SignOutContainer) {
        var SignOut = document.createElement("a");
        SignOut.id = "SignOut";
        SignOut.className = "getstarted";
        SignOut.innerText = "SignOut";
        SignOutContainer.appendChild(SignOut);

        SignOut.addEventListener("click", (e) => {
          e.preventDefault();
          signOut(auth)
            .then(() => {
              location.href = "./pages/login.html";
            })
            .catch((error) => {});
        });
      }
    }
  } else {
    document.getElementById("Dashboard").style.display = "none"; //new line for dynamiccally display the my dashboard
    addLoginButton();
  }
});
function addLoginButton() {
  var loginButtonContainer = document.getElementById("loginButtonContainer");
  if (loginButtonContainer) {
    var loginButton = document.createElement("a");
    loginButton.id = "loginButton";
    loginButton.className = "getstarted";
    loginButton.innerText = "Login";
    loginButtonContainer.appendChild(loginButton);

    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      location.href = "./pages/login.html";
    });
  }
}
function addSignoutButton() {
  var loginButtonContainer = document.getElementById("loginButtonContainer");
  if (loginButtonContainer) {
    var loginButton = document.createElement("a");
    loginButton.id = "loginButton";
    loginButton.className = "getstarted";
    loginButton.innerText = "SignOut";
    loginButtonContainer.appendChild(loginButton);
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          location.href = "./pages/login.html";
        })
        .catch((error) => {});
    });
  }
}
const collectionName = "events";
// Format raw YYYY-MM-DD date string to a user-friendly display date (e.g., Jul 15, 2026)
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  let clean = dateStr.trim();
  if (clean.toLowerCase().startsWith("to ")) {
    clean = clean.substring(3).trim();
  }
  
  // Try YYYY-MM-DD format
  let matchYMD = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchYMD) {
    const d = new Date(parseInt(matchYMD[1]), parseInt(matchYMD[2]) - 1, parseInt(matchYMD[3]));
    return d.toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return dateStr;
}

function createEventCard(event) {
  if (event.flag == "active") {
    const imgHtml = event.imageUrl ? `<img src="${event.imageUrl}" class="event-card-img" alt="${event.name}">` : '';
    const descHtml = event.desc ? `<p class="event-card-desc">${event.desc}</p>` : '';

    const formattedStart = formatDisplayDate(event.startdate);
    const formattedEnd = event.enddate ? formatDisplayDate(event.enddate) : '';
    const displayDateRange = formattedEnd ? `${formattedStart} - ${formattedEnd}` : formattedStart;

    return `
    <div class="col-lg-4 mt-4" data-aos="fade-up" data-aos-delay="100">
        <div class="box featured event-card-modern">
            ${imgHtml}
            <div class="event-card-content">
                <h2 class="event-title">${event.name}</h2>
                <div class="event-date-badge">
                   <i class="bi bi-calendar-event"></i> ${displayDateRange}
                </div>
                ${descHtml}
                <div class="event-details-list">
                    <div class="detail-item">
                        <i class="bi bi-geo-alt"></i>
                        <span>${event.local}</span>
                    </div>
                    <div class="detail-item">
                        <i class="bi bi-clock"></i>
                        <span>${event.time} to ${event.timet}</span>
                    </div>
                    <div class="detail-item">
                        <i class="bi bi-alarm"></i>
                        <span>Deadline: ${event.lastedate}</span>
                    </div>
                </div>
                <div class="event-requirements">
                    <strong>Requirements:</strong>
                    <p>${event.reqirments}</p>
                </div>
                <a href="${event.link}" class="buy-btn" target="_blank">Register Now</a>
            </div>
        </div>
    </div>
 `;
  } else {
    return ``;
  }
}

function renderActiveEventCards(eventsList) {
  const container = document.getElementById("event-cards-row");
  if (!container) return;
  if (!eventsList || eventsList.length === 0) {
    container.innerHTML = `<div class="col-12 text-center my-4"><p class="text-muted" style="font-size: 1.1rem;">No active event cards right now. Check our interactive 3D calendar above for all schedules!</p></div>`;
    return;
  }
  container.innerHTML = eventsList.map(ev => createEventCard(ev)).join("");
}

// Keep track of active events
let activeEvents = [];

// Helper to parse dates from various formats (like YYYY-MM-DD or text "12th October 2023")
function parseDateString(dateStr) {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  if (dateStr.toLowerCase().startsWith("to ")) {
    dateStr = dateStr.substring(3).trim();
  }
  
  // Try YYYY-MM-DD
  let matchYMD = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchYMD) {
    return new Date(parseInt(matchYMD[1]), parseInt(matchYMD[2]) - 1, parseInt(matchYMD[3]));
  }
  
  // Try DD-MM-YYYY or DD/MM/YYYY
  let matchDMY = dateStr.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/);
  if (matchDMY) {
    return new Date(parseInt(matchDMY[3]), parseInt(matchDMY[2]) - 1, parseInt(matchDMY[1]));
  }

  // Try text format like "12th October 2023" or "Oct 12, 2023"
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const fullMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  
  let lower = dateStr.toLowerCase();
  let yearMatch = lower.match(/\b(20\d{2})\b/);
  let year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  
  let month = -1;
  for (let i = 0; i < 12; i++) {
    if (lower.includes(fullMonths[i]) || lower.includes(months[i])) {
      month = i;
      break;
    }
  }
  
  let dayMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
  let day = 1;
  if (dayMatch) {
    day = parseInt(dayMatch[1]);
  }
  
  if (month !== -1) {
    return new Date(year, month, day);
  }
  
  let parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  
  return null;
}

function toISODate(dateStr) {
  if (!dateStr) return "";
  const dateObj = parseDateString(dateStr);
  if (!dateObj) return "";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initialize the 3D Calendar after Firebase loads events & gallery photos
function init3DCalendar(eventsList, galleryImages = []) {
  const photosMap = {};
  eventsList.forEach(ev => {
    if (ev.imageUrl) {
      const dateObj = parseDateString(ev.startdate);
      if (dateObj) {
        const month = dateObj.getMonth();
        if (!photosMap[month]) {
          photosMap[month] = ev.imageUrl;
        }
      }
    }
  });

  const CONFIG = {
    orgName:   "IEDC Saintgits",
    linkLabel: "saintgitsiedc.com",
    websiteUrl:"https://saintgitsiedc.com",
    photos: photosMap,
    events: eventsList.map(ev => ({
      date: toISODate(ev.startdate),
      title: ev.name,
      rawEvent: ev
    }))
  };

  const el = {
    root: document.getElementById('c3dCalendar'),
    tilt: document.getElementById('c3dTilt'),
    spiral: document.getElementById('c3dSpiral'),
    photo: document.getElementById('c3dPhoto'),
    monthLabel: document.getElementById('c3dMonthLabel'),
    yearLabel: document.getElementById('c3dYearLabel'),
    tab: document.getElementById('c3dTab'),
    monthFull: document.getElementById('c3dMonthFull'),
    daygrid: document.getElementById('c3dDaygrid'),
    prev: document.getElementById('c3dPrev'),
    next: document.getElementById('c3dNext'),
    orgName: document.getElementById('c3dOrgName'),
    orgLink: document.getElementById('c3dOrgLink'),
    upcomingList: document.getElementById('c3dUpcomingList')
  };

  if (!el.root) return;

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // ---- brand footer ----
  el.orgName.textContent = CONFIG.orgName;
  el.orgLink.textContent = CONFIG.linkLabel;
  el.orgLink.href = CONFIG.websiteUrl;

  // ---- spiral rings ----
  el.spiral.innerHTML = '';
  for(let i=0;i<20;i++){
    const r = document.createElement('div');
    r.className = 'c3d-ring';
    el.spiral.appendChild(r);
  }

  // ---- events lookup: "YYYY-MM-DD" -> [eventsObj] ----
  const eventsByDate = {};
  CONFIG.events.forEach(ev => {
    if(!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  function pad(n){ return String(n).padStart(2,'0'); }
  function dateKey(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}`; }

  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  let openTooltip = null;

  /* ── Gallery Slideshow Logic for Calendar Photo Panel ── */
  let currentSlideIdx = 0;
  if (window._calendarPhotoSlideshowInterval) {
    clearInterval(window._calendarPhotoSlideshowInterval);
  }

  function getSlideshowPhotoUrl() {
    if (CONFIG.photos[viewMonth]) return CONFIG.photos[viewMonth];
    if (galleryImages && galleryImages.length > 0) {
      return galleryImages[currentSlideIdx % galleryImages.length];
    }
    return null;
  }

  function applyPhotoBackground() {
    if (openTooltip) return; // preserve active event tooltip image
    const photoUrl = getSlideshowPhotoUrl();
    if (photoUrl) {
      el.photo.style.backgroundImage = `url("${photoUrl}")`;
    } else {
      const hue = (viewMonth * 30) % 360;
      el.photo.style.backgroundImage = `linear-gradient(160deg, hsl(${hue},50%,20%), hsl(${(hue+40)%360},42%,38%))`;
    }
  }

  if (galleryImages && galleryImages.length > 0) {
    window._calendarPhotoSlideshowInterval = setInterval(() => {
      if (!openTooltip) {
        currentSlideIdx = (currentSlideIdx + 1) % galleryImages.length;
        applyPhotoBackground();
      }
    }, 3200);
  }

  function closeTooltip(){
    if(openTooltip){ 
      openTooltip.remove(); 
      openTooltip = null; 
      applyPhotoBackground();
    }
  }

  function showTooltip(cell, dayEvents){
    closeTooltip();
    
    // Update photo panel with the active event's image
    const activeEvent = dayEvents[0]?.rawEvent;
    if (activeEvent && activeEvent.imageUrl) {
      el.photo.style.backgroundImage = `url("${activeEvent.imageUrl}")`;
    }

    const tip = document.createElement('div');
    tip.className = 'c3d-tooltip';
    tip.innerHTML = dayEvents.map(ev => {
      const raw = ev.rawEvent;
      const timeStr = raw.time ? `${raw.time}${raw.timet ? ' to ' + raw.timet : ''}` : '';
      const locStr = raw.local || '';
      const descStr = raw.desc || '';
      const linkStr = raw.link || '#';
      
      return `
        <div class="c3d-tooltip-item">
          ${raw.imageUrl ? `<img src="${raw.imageUrl}" class="c3d-tooltip-img" style="width: 100%; max-height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" alt="${ev.title}">` : ''}
          <div class="c3d-tooltip-title">${ev.title}</div>
          ${timeStr ? `<div class="c3d-tooltip-time"><i class="bi bi-clock"></i> ${timeStr}</div>` : ''}
          ${locStr ? `<div class="c3d-tooltip-loc"><i class="bi bi-geo-alt"></i> ${locStr}</div>` : ''}
          ${descStr ? `<div class="c3d-tooltip-desc">${descStr}</div>` : ''}
          ${linkStr !== '#' ? `<a href="${linkStr}" target="_blank" class="c3d-tooltip-btn">Register Now</a>` : ''}
        </div>
      `;
    }).join('<hr class="c3d-tooltip-divider">');
    
    cell.appendChild(tip);
    tip.style.bottom = 'calc(100% + 9px)';
    tip.style.left = '50%';
    tip.style.transform = 'translateX(-50%)';
    openTooltip = tip;
  }

  document.addEventListener('click', function(e){
    if(!e.target.closest('.c3d-bubble') && !e.target.closest('.c3d-tooltip')){
      closeTooltip();
    }
  });

  function render(animate){
    const grid = el.daygrid;
    if(animate){ grid.classList.add('c3d-anim'); }

    // photo panel
    applyPhotoBackground();
    el.monthLabel.textContent = MONTHS[viewMonth];
    el.yearLabel.textContent = viewYear;
    el.tab.textContent = pad(viewMonth+1);
    el.monthFull.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    // build day cells
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();

    const frag = document.createDocumentFragment();
    for(let i=0;i<firstDow;i++){
      const blank = document.createElement('div');
      blank.className = 'c3d-day c3d-blank';
      frag.appendChild(blank);
    }
    for(let d=1; d<=daysInMonth; d++){
      const key = dateKey(viewYear, viewMonth, d);
      const cell = document.createElement('div');
      cell.className = 'c3d-day';
      if(key === todayKey) cell.classList.add('c3d-today');
      cell.textContent = d;

      const dayEvents = eventsByDate[key];
      if (dayEvents && dayEvents.length > 0) {
        cell.classList.add('c3d-has-event');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `${dayEvents.length} event(s) on ${MONTHS[viewMonth]} ${d}`);
        
        cell.addEventListener('click', function(e) {
          e.stopPropagation();
          if (openTooltip && openTooltip.parentElement === cell) { closeTooltip(); return; }
          showTooltip(cell, dayEvents);
        });

        if (dayEvents.length > 1) {
          const bubble = document.createElement('span');
          bubble.className = 'c3d-bubble';
          bubble.textContent = dayEvents.length;
          bubble.setAttribute('role', 'button');
          cell.appendChild(bubble);
        }
      }
      frag.appendChild(cell);
    }

    requestAnimationFrame(()=>{
      grid.innerHTML = '';
      grid.appendChild(frag);
      requestAnimationFrame(()=> grid.classList.remove('c3d-anim'));
    });

    renderUpcoming();
  }

  function renderUpcoming() {
    const upcoming = CONFIG.events
      .filter(ev => ev.date >= todayKey)
      .sort((a,b)=> a.date.localeCompare(b.date))
      .slice(0,5);

    el.upcomingList.innerHTML = '';
    if(upcoming.length === 0){
      const li = document.createElement('li');
      li.innerHTML = `<span class="c3d-uempty">No upcoming events scheduled.</span>`;
      el.upcomingList.appendChild(li);
      return;
    }
    upcoming.forEach(ev => {
      const [y,m,d] = ev.date.split('-').map(Number);
      const li = document.createElement('li');
      const niceDate = `${MONTHS[m-1].slice(0,3)} ${d}`;
      li.innerHTML = `<span class="c3d-udate">${niceDate}</span><span class="c3d-utitle">${ev.title}</span>`;
      li.addEventListener('click', ()=>{
        viewYear = y; viewMonth = m-1;
        render(true);
        el.root.scrollIntoView({behavior:'smooth', block:'center'});
      });
      el.upcomingList.appendChild(li);
    });
  }

  el.prev.addEventListener('click', ()=>{
    closeTooltip();
    viewMonth--;
    if(viewMonth < 0){ viewMonth = 11; viewYear--; }
    render(true);
  });
  el.next.addEventListener('click', ()=>{
    closeTooltip();
    viewMonth++;
    if(viewMonth > 11){ viewMonth = 0; viewYear++; }
    render(true);
  });

  // ---- gentle mouse-parallax tilt ----
  const canTilt = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(canTilt){
    const stage = el.tilt.parentElement;
    stage.addEventListener('mousemove', (e)=>{
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = 3 - (py - 0.5) * 10;
      const ry = -1.5 + (px - 0.5) * 12;
      el.tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    stage.addEventListener('mouseleave', ()=>{
      el.tilt.style.transform = 'rotateX(3deg) rotateY(-1.5deg)';
    });
  }

  render(false);
}

// Load and initialize Events and Gallery Photos for Calendar Slideshow
const querySnapshot = await getDocs(collection(db, "Events"));
const events = [];
querySnapshot.forEach((doc) => {
  events.push(doc.data());
});

// Load Gallery items for the left photo panel slideshow
let gallerySlideshowImages = [
  "./assets/img/portfolio/1.webp",
  "./assets/img/portfolio/2.webp",
  "./assets/img/portfolio/3.webp",
  "./assets/img/portfolio/im1.webp",
  "./assets/img/portfolio/im4.webp",
  "./assets/img/portfolio/im5.webp",
  "./assets/img/portfolio/im6.webp",
  "./assets/img/portfolio/im8.webp",
  "./assets/img/portfolio/img10.webp"
];

try {
  const gallerySnapshot = await getDocs(collection(db, "Gallery"));
  gallerySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.imageUrl && !gallerySlideshowImages.includes(data.imageUrl)) {
      gallerySlideshowImages.unshift(data.imageUrl);
    }
  });
} catch (err) {
  console.warn("Could not load gallery photos for calendar:", err);
}

// Cache active events
activeEvents = events.filter(e => e.flag === "active");

// Initialize 3D Calendar and Active Event cards with loaded events & gallery slideshow
init3DCalendar(activeEvents, gallerySlideshowImages);
renderActiveEventCards(activeEvents);
