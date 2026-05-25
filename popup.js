// Dark Mode Logic
const darkModeBtn = document.getElementById('darkModeBtn');

if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark');
  darkModeBtn.innerText = '☀️';
}

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
  document.getElementById('actionBtns').style.display = 'none';
  document.getElementById('copyMsg').style.display = 'none';
  document.getElementById('pdfMsg').style.display = 'none';

  const language = document.getElementById('languageSelect').value;

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
          body: JSON.stringify({
            text: response.text,
            language: language
          })
        });

        const data = await res.json();
        document.getElementById('loading').style.display = 'none';

        if (data.summary) {
          document.getElementById('summary').innerText = data.summary;
          document.getElementById('actionBtns').style.display = 'flex';
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
    document.getElementById('pdfMsg').style.display = 'none';
    document.getElementById('copyBtn').innerText = '✅ Copied!';
    setTimeout(() => {
      document.getElementById('copyMsg').style.display = 'none';
      document.getElementById('copyBtn').innerText = '📋 Copy';
    }, 2000);
  });
});

// Read Aloud Logic
let isSpeaking = false;

document.getElementById('readAloudBtn').addEventListener('click', () => {
  const summaryText = document.getElementById('summary').innerText;

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    document.getElementById('readAloudBtn').innerText = '🎙️ Read';
  } else {
    const speech = new SpeechSynthesisUtterance(summaryText);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onend = () => {
      isSpeaking = false;
      document.getElementById('readAloudBtn').innerText = '🎙️ Read';
    };

    window.speechSynthesis.speak(speech);
    isSpeaking = true;
    document.getElementById('readAloudBtn').innerText = '⏹️ Stop';
  }
});

// PDF Export Logic
document.getElementById('pdfBtn').addEventListener('click', () => {
  const summaryText = document.getElementById('summary').innerText;
  const pageTitle = document.title || 'Summary';

  // Create a new window with the summary
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Page Summary</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          color: #111827;
        }
        h1 {
          color: #4F46E5;
          border-bottom: 2px solid #4F46E5;
          padding-bottom: 10px;
        }
        .summary {
          font-size: 16px;
          line-height: 1.8;
          white-space: pre-wrap;
          margin-top: 20px;
        }
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #6B7280;
          border-top: 1px solid #E5E7EB;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <h1>🧠 Page Summary</h1>
      <div class="summary">${summaryText}</div>
      <div class="footer">
        Generated by Web Page Summarizer Extension • ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();

  // Auto print as PDF
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };

  // Show success message
  document.getElementById('pdfMsg').style.display = 'block';
  document.getElementById('copyMsg').style.display = 'none';
  setTimeout(() => {
    document.getElementById('pdfMsg').style.display = 'none';
  }, 2000);
});