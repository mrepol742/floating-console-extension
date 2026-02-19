console.log("App initialized successfully");
console.info("User session started", { userId: 1024, role: "admin" });
console.warn("API response time is slower than expected:", 842, "ms");
console.error("Failed to fetch data from /api/products");

console.log("User clicked button:", { id: "submit-btn", timestamp: Date.now() });

console.warn("Deprecated function used: oldCalculateTotal()");

console.error("Unhandled exception:", new Error("Something went wrong"));

console.info("Theme switched to dark mode");

console.log("Large object test:", {
  name: "Floating Console",
  version: "1.0.0",
  features: ["Logs", "Search", "Dark Mode", "Draggable"],
  status: "Active"
});

setTimeout(() => {
  console.error("Simulated async error after 2 seconds");
}, 2000);

Promise.reject("Simulated unhandled rejection");
