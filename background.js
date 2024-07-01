// Function to load JSON database
function loadDatabase() {
  return new Promise((resolve) => {
    chrome.storage.local.get('formDatabase', (result) => {
      resolve(result.formDatabase || {});
    });
  });
}

// Function to convert JSON to YAML and download it
function dumpDatabaseToYAML() {
  loadDatabase().then((dbData) => {
    const yamlText = jsyaml.dump(dbData);
    const blob = new Blob([yamlText], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);

    // Create a link element to initiate the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'form_data_dump.yaml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    console.log('Database dumped to YAML and downloaded.');
  });
}

// Set up a recurring alarm every minute
chrome.alarms.create('dumpDatabaseAlarm', {
  periodInMinutes: 1
});

// Handle the alarm event
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dumpDatabaseAlarm') {
    dumpDatabaseToYAML();
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showForms") {
    // Log the received form data
    console.log("Received form data:", message.data);
    
    // Store the form data in chrome.storage.local
    chrome.storage.local.set({ formData: message.data }, () => {
      console.log("Form data stored in chrome.storage.local");
    });
    
    sendResponse({ status: "success" });
  }
});
