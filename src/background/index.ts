// UChiSchedule background service worker
// Handles opening the calendar tab and message passing

chrome.action.onClicked.addListener(() => {
  // Open popup by default (handled by manifest action.default_popup)
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "OPEN_CALENDAR") {
    chrome.tabs.create({ url: chrome.runtime.getURL("src/calendar/index.html") });
    sendResponse({ ok: true });
  }
  return true;
});
