chrome.action.onClicked.addListener(async (tab) => {
  // Chrome internal pages can never have content scripts
  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
  } catch {
    // Content script not present — tab was open before the extension loaded.
    // Inject now, then send the message.
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["readability.js", "content.js"] });
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["reader.css"] });
    await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
  }
});
