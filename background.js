chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showForms") {
    chrome.storage.local.set({ formLogs: request.data }, () => {
      console.log('Form data saved to storage');
      sendResponse({ status: "success" });
    });
    return true; // Keep the message channel open for sendResponse
  }
});
