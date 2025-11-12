// ====== client.js ======
// Shared helper for WebSocket (Socket.IO) connection

(function () {
  // Create and return a socket connection
  window.createSocket = function (role) {
    const socket = io({ transports: ["websocket"], upgrade: false });

    socket.on("connect", () => {
      console.log("Connected to ClassPulse server ✅");
      socket.emit("identify", { role: role });
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected ❌");
    });

    return socket;
  };

  // Helper to convert timestamps to readable time
  window.humanTime = function (ts) {
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString();
  };
})();
