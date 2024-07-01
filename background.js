chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "logData") {
      console.log("Received logData request:", request.data);
      chrome.storage.local.get({ logs: [] }, (result) => {
        const logs = result.logs;
        logs.push(request.data);
        chrome.storage.local.set({ logs: logs }, () => {
          console.log("Data logged successfully");
          sendResponse({ status: "success" });
        });
      });
      return true;  // keep the message channel open for sendResponse
    }
  });
  