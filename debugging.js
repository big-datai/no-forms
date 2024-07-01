(function() {
    console.log("Script started");
  
    // Function to run after DOM is fully loaded
    function runScript() {
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
    }
  
    // Ensure the script runs after the DOM is fully loaded
    if (document.readyState === "complete" || document.readyState === "interactive") {  
      runScript();
    } else {
      document.addEventListener("DOMContentLoaded", runScript);
    }
  
    console.log("Script ended");
  })();
  
 