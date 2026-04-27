const targetDate = new Date("2026-09-12T19:00:00").getTime();
// Yayin oncesi: etkinlik tarih/saatini kesin bilgiye gore guncelle.
const eventStart = new Date("2026-09-12T19:00:00");
const eventEnd = new Date("2026-09-12T23:00:00");

const inviteIntro = document.getElementById("inviteIntro");
const openInviteBtn = document.getElementById("openInviteBtn");
const welcomeToast = document.getElementById("welcomeToast");
const closeWelcomeBtn = document.getElementById("closeWelcomeBtn");

let isIntroClosed = false;
let welcomeTimer;

function hideWelcomeToast() {
  if (!welcomeToast) {
    return;
  }

  welcomeToast.classList.remove("show");
  welcomeToast.setAttribute("aria-hidden", "true");

  if (welcomeTimer) {
    clearTimeout(welcomeTimer);
  }
}

function showWelcomeToast() {
  if (!welcomeToast) {
    return;
  }

  welcomeToast.classList.add("show");
  welcomeToast.setAttribute("aria-hidden", "false");

  if (welcomeTimer) {
    clearTimeout(welcomeTimer);
  }

  welcomeTimer = setTimeout(hideWelcomeToast, 6200);
}

function createSparkleBurst() {
  if (!inviteIntro) {
    return;
  }

  for (let i = 0; i < 18; i += 1) {
    const dot = document.createElement("span");
    dot.className = "sparkle-burst";

    const angle = (Math.PI * 2 * i) / 18;
    const distance = 28 + Math.random() * 70;
    dot.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    dot.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    dot.style.left = "50%";
    dot.style.top = "58%";

    inviteIntro.appendChild(dot);
    setTimeout(() => dot.remove(), 750);
  }
}

function closeIntro(skipAnimation = false) {
  if (!inviteIntro || isIntroClosed) {
    return;
  }

  isIntroClosed = true;

  if (skipAnimation) {
    inviteIntro.classList.add("opened");
    document.body.classList.remove("intro-lock");
    return;
  }

  createSparkleBurst();
  inviteIntro.classList.add("opening");

  setTimeout(() => {
    inviteIntro.classList.add("opened");
    document.body.classList.remove("intro-lock");
    setTimeout(showWelcomeToast, 300);
  }, 950);
}

if (inviteIntro && openInviteBtn) {
  document.body.classList.add("intro-lock");
  openInviteBtn.addEventListener("click", () => closeIntro(false));

  window.addEventListener("keydown", (event) => {
    if (isIntroClosed) {
      return;
    }

    if (event.key === "Enter") {
      closeIntro(false);
    }
  });
}

if (closeWelcomeBtn) {
  closeWelcomeBtn.addEventListener("click", hideWelcomeToast);
}

const dayEl = document.getElementById("days");
const hourEl = document.getElementById("hours");
const minuteEl = document.getElementById("minutes");
const secondEl = document.getElementById("seconds");

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = Date.now();
  const distance = targetDate - now;

  if (distance <= 0) {
    dayEl.textContent = "00";
    hourEl.textContent = "00";
    minuteEl.textContent = "00";
    secondEl.textContent = "00";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  dayEl.textContent = pad(days);
  hourEl.textContent = pad(hours);
  minuteEl.textContent = pad(minutes);
  secondEl.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealNodes = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.2
  }
);

revealNodes.forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index * 100, 450)}ms`;
  revealObserver.observe(node);
});

function toCalendarUtc(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildGoogleCalendarUrl() {
  const title = "Ahmet ve İrem Nişan Töreni";
  const details = "Nişan davetimize katılımınız bizi mutlu edecektir.";
  const location = "Lavinya Koru, Ümitköy, Çankaya, Ankara";
  const dates = `${toCalendarUtc(eventStart)}/${toCalendarUtc(eventEnd)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details,
    location,
    dates
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsFile() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//DavetiyeLink//Nisan Davetiyesi//TR",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@davetiyelink.local`,
    `DTSTAMP:${toCalendarUtc(new Date())}`,
    `DTSTART:${toCalendarUtc(eventStart)}`,
    `DTEND:${toCalendarUtc(eventEnd)}`,
    "SUMMARY:Ahmet ve İrem Nişan Töreni",
    "DESCRIPTION:Nişan davetimize katılımınız bizi mutlu edecektir.",
    "LOCATION:Lavinya Koru, Ümitköy, Çankaya, Ankara",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8"
  });
}

const googleCalendarBtn = document.getElementById("googleCalendarBtn");
const icsDownloadBtn = document.getElementById("icsDownloadBtn");

if (googleCalendarBtn) {
  const googleCalendarUrl = buildGoogleCalendarUrl();
  googleCalendarBtn.href = googleCalendarUrl;
  googleCalendarBtn.addEventListener("click", (event) => {
    event.preventDefault();
    window.open(googleCalendarUrl, "_blank", "noopener,noreferrer");
  });
}

if (icsDownloadBtn) {
  const icsFile = buildIcsFile();
  icsDownloadBtn.href = URL.createObjectURL(icsFile);
  icsDownloadBtn.download = "ahmet-irem-nisan.ics";
}
