import OpenAI from "openai";

const openai = new OpenAI("");

async function getChatGPTSuggestion(field) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: `Suggest a value for the field: ${field}` }],
    });

    const suggestion = response.choices[0].message.content.trim();
    return suggestion;
  } catch (error) {
    console.error("Error getting suggestion:", error);
    return `Suggestion for ${field}`;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showForms") {
    console.log("Received form data:", message.data);
    chrome.storage.local.set({ formData: message.data }, () => {
      console.log("Form data stored in chrome.storage.local");
    });
    sendResponse({ status: "success" });
  } else if (message.action === "exportYAML") {
    exportDatabaseToYAML();
    sendResponse({ status: "export initiated" });
  } else if (message.action === "getChatGPTSuggestion") {
    getChatGPTSuggestion(message.field).then((suggestion) => {
      sendResponse({ suggestion });
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

// Function to load JSON database
function loadDatabase() {
  return new Promise((resolve) => {
    chrome.storage.local.get('formDatabase', (result) => {
      resolve(result.formDatabase || {});
    });
  });
}

// Function to convert JSON to YAML and download it
function exportDatabaseToYAML() {
  loadDatabase().then((dbData) => {
    const yamlText = jsyaml.dump(dbData);
    const blob = new Blob([yamlText], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);

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
    exportDatabaseToYAML();
  }
});
