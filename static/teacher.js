// ====== teacher.js ======
const socket = createSocket("teacher");
const seenEvents = new Set();

// ====== Teacher QR Init ======
socket.on("teacher_init", (data) => {
  const qr = data.qr;
  const el = document.getElementById("qr-placeholder");
  el.innerHTML = `<img src="${qr}" alt="QR" style="max-width:100%; max-height:100%">`;

  const url = new URL(window.location.href);
  const base = url.origin;
  document.getElementById("join-url").innerText = base + "/student";
});

// ====== Helper for live presence list ======
function appendToLiveFeed(text, colorClass) {
  const ulFeed = document.getElementById("live-feed");
  if (!ulFeed) return;

  const li = document.createElement("li");
  li.textContent = text;
  li.classList.add(colorClass, "rounded", "px-2", "py-1");
  ulFeed.insertBefore(li, ulFeed.firstChild);

  // smooth fade-in + timed fade-out
  li.classList.add("fade-in");
  setTimeout(() => li.classList.add("fade-out"), 8000);
  setTimeout(() => li.remove(), 9500);
}

// ====== Summary Updates ======
socket.on("summary", (s) => {
  // Student count + engagement
  document.getElementById("student-count").innerText = String(s.student_count || 0);

  const eng = s.engagement || 0;
  const percent = 50 + eng / 2;
  document.getElementById("engagement-bar").style.width =
    Math.max(0, Math.min(100, percent)) + "%";
  document.getElementById("engagement-value").innerText = `Score: ${eng}`;

  const ulSys = document.getElementById("events-system");
  const ulMsg = document.getElementById("events-messages");
  const ulFeed = document.getElementById("live-feed");
  if (!ulSys || !ulMsg || !ulFeed) return;

  (s.recent_events || [])
    .slice()
    .reverse()
    .forEach((ev) => {
      const key = `${ev.ts}-${ev.type}-${ev.name}-${ev.text || ""}`;
      if (seenEvents.has(key)) return;
      seenEvents.add(key);

      // --- Joins/Leaves ---
      if (ev.type === "joined" || ev.type === "left") {
        const li = document.createElement("li");
        li.dataset.key = key;
        li.classList.add("rounded", "px-2", "py-1");

        if (ev.type === "joined") {
          li.textContent = `👋 ${ev.name} joined`;
          li.classList.add("bg-green-100");
          ulSys.insertBefore(li, ulSys.firstChild);

          // Live feed mirror
          appendToLiveFeed(`🟢 ${ev.name} joined`, "bg-green-100");
        } else {
          li.textContent = `🚪 ${ev.name} left`;
          li.classList.add("bg-red-100");
          ulSys.insertBefore(li, ulSys.firstChild);

          appendToLiveFeed(`🔴 ${ev.name} left`, "bg-red-100");
        }
      }

      // --- Messages ---
      else if (ev.type === "message") {
        const li = document.createElement("li");
        li.textContent = `💬 ${ev.name}: ${ev.text}`;
        li.classList.add("bg-gray-100");
        ulMsg.insertBefore(li, ulMsg.firstChild);
      }
    });
});

// ====== Real-time Join/Leave (instant updates for Live Presence) ======
socket.on("student_joined", (data) => {
  appendToLiveFeed(`🟢 ${data.name} joined`, "bg-green-100");
});

socket.on("student_left", (data) => {
  appendToLiveFeed(`🔴 ${data.name} left`, "bg-red-100");
});

// ====== Floating Emoji Animations ======
socket.on("reaction", (r) => {
  const area = document.getElementById("floating-area");
  if (!area) return;

  const emojiEl = document.createElement("div");
  emojiEl.className = "floating-emoji";
  emojiEl.style.left = 15 + Math.random() * 70 + "%";
  emojiEl.style.top = "42%"; // slightly higher for better centering

  let emoji = "👍";
  let glow = "rgba(59, 130, 246, 0.9)";

  if (r.reaction === "confused") {
    emoji = "😕";
    glow = "rgba(234, 179, 8, 0.9)";
  } else if (r.reaction === "rocket") {
    emoji = "🚀";
    glow = "rgba(16, 185, 129, 0.9)";
  }

  emojiEl.textContent = emoji;
  emojiEl.style.fontSize = "68px";
  emojiEl.style.filter = `
    drop-shadow(0 0 10px ${glow})
    drop-shadow(0 0 30px ${glow})
    drop-shadow(0 0 50px ${glow})
  `;
  emojiEl.style.animation = "floatUpCenterDrift 4.8s cubic-bezier(0.25, 1, 0.5, 1) forwards";
  area.appendChild(emojiEl);

  // Ripple effect under emoji
  const ripple = document.createElement("div");
  ripple.className = "reaction-ripple";
  ripple.style.left = emojiEl.style.left;
  ripple.style.borderColor = glow;
  area.appendChild(ripple);

  setTimeout(() => {
    emojiEl.remove();
    ripple.remove();
  }, 4800);
});

// ====== Real-time Messages ======
socket.on("message", (m) => {
  const ulMsg = document.getElementById("events-messages");
  const key = `${m.name}-${m.text}-${Date.now()}`;
  if (seenEvents.has(key)) return;
  seenEvents.add(key);

  const li = document.createElement("li");
  li.textContent = `💬 ${m.name}: ${m.text}`;
  li.classList.add("bg-gray-100", "rounded", "px-2", "py-1");
  ulMsg.insertBefore(li, ulMsg.firstChild);
});
