// ====== student.js ======
const socketS = createSocket("student");
let joined = false;

// Handle join button
document.getElementById("joinBtn").addEventListener("click", () => {
  if (joined) return;

  const name = document.getElementById("name").value.trim();
  socketS.emit("student_join", { name: name });
  joined = true;

  // Update UI
  document.getElementById("controls").classList.remove("hidden");
  document.getElementById("joinedMsg").innerText =
    "✅ Joined session! You can now react or send a message.";
  document.getElementById("joinBtn").disabled = true;
  document.getElementById("leaveBtn").disabled = false;
});

// Handle leave button
document.getElementById("leaveBtn").addEventListener("click", () => {
  if (!joined) return;

  socketS.emit("student_leave");
  joined = false;

  // Reset UI
  document.getElementById("controls").classList.add("hidden");
  document.getElementById("joinedMsg").innerText = "❌ You left the session.";
  document.getElementById("joinBtn").disabled = false;
  document.getElementById("leaveBtn").disabled = true;
});

// Emoji reaction buttons
document.querySelectorAll(".react").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!joined) {
      alert("Please join first!");
      return;
    }

    const key = btn.getAttribute("data-key");
    socketS.emit("reaction", { reaction: key });

    // Tiny visual feedback
    btn.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.15)" },
        { transform: "scale(1)" },
      ],
      { duration: 200 }
    );
  });
});

// Send message
document.getElementById("sendMsg").addEventListener("click", () => {
  if (!joined) {
    alert("Please join first!");
    return;
  }

  const text = document.getElementById("msg").value.trim();
  if (!text) return;

  socketS.emit("message", { text: text });
  document.getElementById("msg").value = "";
  document.getElementById("msgInfo").innerText = "✅ Message sent!";
  setTimeout(() => (document.getElementById("msgInfo").innerText = ""), 3000);
});

// Rate limit feedback
socketS.on("rate_limited", (d) => {
  const retry = d.retry_in || 0;
  document.getElementById(
    "msgInfo"
  ).innerText = `⏳ Rate limited. Try again in ${retry}s.`;
});

// Handle errors
socketS.on("error", (e) => {
  console.warn("Socket error:", e);
  alert(e.msg || "Error sending message");
});
