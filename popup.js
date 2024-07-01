document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup script loaded and ready');
  
  document.getElementById('viewLogs').addEventListener('click', () => {
    chrome.storage.local.get('formData', (result) => {
      const logsDiv = document.getElementById('logs');
      
      console.log('Retrieved logs:', result.formData);
      
      if (result.formData && result.formData.length > 0) {
        logsDiv.innerHTML = `<pre>${JSON.stringify(result.formData, null, 2)}</pre>`;
      } else {
        logsDiv.innerHTML = 'No logs available.';
      }
    });
    console.log('Logs displayed');
  });

  document.getElementById('exportYAML').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "exportYAML" }, (response) => {
      console.log('Export YAML response:', response);
    });
  });
});
