document.getElementById('summarizeBtn').addEventListener('click', async () => {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('summary').innerText = '';

  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject content script manually
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'getPageText' }, async (response) => {
      
      // Check if response exists
      if (!response || !response.text) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('summary').innerText = 'Error: Could not read page content. Please refresh the page and try again.';
        return;
      }

      try {
        // Send text to backend
        const res = await fetch('http://localhost:3000/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: response.text })
        });

        const data = await res.json();
        document.getElementById('loading').style.display = 'none';

        if (data.summary) {
          document.getElementById('summary').innerText = data.summary;
        } else {
          document.getElementById('summary').innerText = 'Error: No summary received.';
        }

      } catch (fetchError) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('summary').innerText = 'Error: Backend server is not running. Please start node server.js';
      }
    });

  } catch (error) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('summary').innerText = 'Error: ' + error.message;
  }
});