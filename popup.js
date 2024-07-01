document.getElementById('viewLogs').addEventListener('click', () => {
    chrome.storage.local.get('logs', (result) => {
        const logsDiv = document.getElementById('logs');
        logsDiv.innerHTML = `<pre>${JSON.stringify(result.logs, null, 2)}</pre>`;
    });
    console.log("Logs displayed");
});
