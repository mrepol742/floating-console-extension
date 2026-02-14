chrome.runtime.onInstalled.addListener(() => {
  console.info("Hello world from the background script!");
  console.log("Floating Console installed");
});
