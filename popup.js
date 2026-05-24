// Dark Mode Logic
const darkModeBtn = document.getElementById('darkModeBtn');

// Check if dark mode was saved before
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
  darkModeBtn.innerText = '☀️';
}

// Toggle dark mode on button click
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  
  if (document.body.classList.contains('dark')) {
    darkModeBtn.innerText = '☀️';
    localStorage.setItem('darkMode', 'enabled');
  } else {
    darkModeBtn.innerText = '🌙';
    localStorage.setItem('darkMode', 'disabled');
  }
});

// Summarize Button Logic
document.getElementById('summarizeBtn').addEventListener('click', async () => {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('summary').innerText = '';
  document.getElementById('copyBtn').style.display = 'none';
  document.getElementById('copyMsg').style.display = 'none';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: 'getPageText' }, async (response) => {

      if (!response || !response.text) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('summary').innerText = 'Error: Could not read page. Please refresh and try again.';
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: response.text })
        });

        const data = await res.json();
        document.getElementById('loading').style.display = 'none';

        if (data.summary) {
          document.getElementById('summary').innerText = data.summary;
          document.getElementById('copyBtn').style.display = 'block';
        } else {
          document.getElementById('summary').innerText = 'Error: No summary received.';
        }

      } catch (fetchError) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('summary').innerText = 'Error: Backend server is not running!';
      }
    });

  } catch (error) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('summary').innerText = 'Error: ' + error.message;
  }
});

// Copy Button Logic
document.getElementById('copyBtn').addEventListener('click', () => {
  const summaryText = document.getElementById('summary').innerText;

  navigator.clipboard.writeText(summaryText).then(() => {
    document.getElementById('copyMsg').style.display = 'block';
    document.getElementById('copyBtn').innerText = '✅ Copied!';

    setTimeout(() => {
      document.getElementById('copyMsg').style.display = 'none';
      document.getElementById('copyBtn').innerText = '📋 Copy Summary';
    }, 2000);
  });
});