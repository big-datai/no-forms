(function() {
  console.log("Script started");

  async function loadYAMLFile() {
    const response = await fetch(chrome.runtime.getURL('form_data.yaml'));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return jsyaml.load(text);
  }

  function loadDatabase() {
    return new Promise((resolve) => {
      chrome.storage.local.get('formDatabase', (result) => {
        resolve(result.formDatabase || {});
      });
    });
  }

  function saveToDatabase(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ formDatabase: data }, () => {
        resolve();
      });
    });
  }

  async function getChatGPTSuggestion(field) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getChatGPTSuggestion", field }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting suggestion:", chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(response.suggestion);
        }
      });
    });
  }

  function fillForms(yamlData, dbData) {
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      const elements = form.elements;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const fieldName = element.name || element.id;
        if (!fieldName) continue;

        let value = yamlData ? yamlData[fieldName] : undefined;
        value = value || dbData[fieldName];
        if (value === undefined) {
          getChatGPTSuggestion(fieldName).then((suggestion) => {
            const suggestionNode = document.createElement('span');
            suggestionNode.textContent = suggestion;
            suggestionNode.style.color = 'blue';
            element.parentElement.appendChild(suggestionNode);
          });
          element.style.backgroundColor = "red"; // Highlight unfilled fields in red
        } else {
          if (element.type === "checkbox" || element.type === "radio") {
            element.checked = value === "checked";
          } else {
            element.value = value;
          }
          element.style.backgroundColor = "blue"; // Highlight filled fields in blue
          dbData[fieldName] = value; // Update the database
        }
      }
    });
    saveToDatabase(dbData);
  }

  async function processForms() {
    try {
      const yamlData = await loadYAMLFile();
      const dbData = await loadDatabase();

      const forms = document.querySelectorAll("form");
      console.log(`Number of forms detected: ${forms.length}`);

      const formNames = [];

      forms.forEach((form, index) => {
        form.style.backgroundColor = "yellow"; // Highlight the form in yellow
        console.log(`Processing form ${index + 1}`);
        formNames.push(`Form ${index + 1}:`);
        const elements = form.elements;
        console.log(`Number of elements in form ${index + 1}: ${elements.length}`);
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const description = getFormElementDescription(element);
          console.log(`Detected element: ${description}`);
          formNames.push(` - ${description}`);
        }
      });

      console.log("Detected forms and elements:", formNames);

      // Send the form names to the background script for storage
      chrome.runtime.sendMessage({ action: "showForms", data: formNames }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError.message);
        } else {
          console.log("Message sent to background script with response:", response);
        }
      });

      // Fill the forms
      fillForms(yamlData, dbData);
    } catch (error) {
      console.error("Error processing forms:", error);
    }
  }

  function getFormElementDescription(element) {
    let label = element.closest('label');
    if (!label) {
      label = document.querySelector(`label[for="${element.id}"]`);
    }
    return label ? label.textContent.trim() : element.name || element.id || 'Unnamed element';
  }

  function runScript() {
    console.log("DOM fully loaded and parsed");

    // Add a slight delay before initial form processing
    setTimeout(() => {
      processForms();
    }, 1000);

    // Use MutationObserver to detect dynamically added forms
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'FORM' || (node.querySelectorAll && node.querySelectorAll('form').length > 0)) {
              console.log('New form detected');
              processForms();
            }
          });
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    runScript();
  } else {
    document.addEventListener("DOMContentLoaded", runScript);
  }

  console.log("Script ended");
})();
