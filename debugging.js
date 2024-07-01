document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    const forms = document.querySelectorAll("form");
    const formNames = [];
  
    forms.forEach((form, index) => {
      formNames.push(`Form ${index + 1}:`);
      const elements = form.elements;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        formNames.push(` - ${element.name || element.id || `Unnamed element ${i + 1}`}`);
      }
    });
  
    console.log("Detected forms and elements:", formNames);
  
    // Send the form names to the popup for display
    chrome.runtime.sendMessage({ action: "showForms", data: formNames }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
      } else {
        console.log("Message sent to background script with response:", response);
      }
    });
  });
  