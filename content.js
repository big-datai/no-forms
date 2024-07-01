document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    const forms = document.querySelectorAll("form");
    const formData = [];
  
    forms.forEach((form) => {
      const elements = form.elements;
      const data = {};
  
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        data[element.name] = element.value;
        element.style.backgroundColor = "yellow"; // highlight detected fields
      }
  
      formData.push(data);
    });
  
    console.log("Form data collected:", formData);
  
    chrome.runtime.sendMessage({ action: "logData", data: formData }, (response) => {
      if (response.status === "success") {
        forms.forEach((form) => {
          const elements = form.elements;
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            fillFormElement(element).then(success => {
              if (success) {
                element.style.backgroundColor = "blue"; // highlight filled fields
              } else {
                element.style.backgroundColor = "red"; // highlight failed fields
              }
            });
          }
        });
      }
    });
  });
  
  async function fillFormElement(element) {
    try {
      const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        },
        body: JSON.stringify({
          prompt: `Fill this form element: ${element.name}`,
          max_tokens: 10
        })
      });
  
      const data = await response.json();
      if (data.choices && data.choices[0].text) {
        element.value = data.choices[0].text.trim();
        return true;
      }
    } catch (error) {
      console.error('Error filling form element:', error);
    }
    return false;
  }
  