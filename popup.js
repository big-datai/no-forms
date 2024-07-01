document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup script loaded and ready');
  
    chrome.storage.local.get('formLogs', (result) => {
      console.log('Retrieved formLogs from storage:', result);
      
      const logsDiv = document.getElementById('logs');
      
      if (result.formLogs) {
        logsDiv.innerHTML = `<pre>${result.formLogs.join('\n')}</pre>`;
        console.log("Displayed forms:", result.formLogs);
      } else {
        logsDiv.innerHTML = "No logs available.";
        console.error('No form logs found in storage.');
      }
    });
  });
  