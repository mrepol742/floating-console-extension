chrome.runtime.onInstalled.addListener(() => {
  console.info("Hello world from the background script!");
  console.log("Floating Console installed");
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-console" || command === "toggle-float") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: command,
      });
    }
  }
});
