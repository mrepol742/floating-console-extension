document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const isRestricted =
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("edge://");

  const toggleBtn = document.getElementById("toggle-console");

  if (isRestricted) {
    toggleBtn.disabled = true;
    toggleBtn.textContent = "Not available on this page";
    return;
  }

  toggleBtn.addEventListener("click", () => {
    chrome.tabs.sendMessage(tab.id, {
      action: "toggleConsole",
    });
  });

  const url = new URL(tab.url);
  document.getElementById("current-domain").textContent = url.hostname;
});
