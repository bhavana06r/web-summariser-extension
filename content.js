chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageText') {
    try {
      const text = document.body.innerText.slice(0, 5000);
      sendResponse({ text: text });
    } catch (error) {
      sendResponse({ text: '' });
    }
  }
  return true; // ← This line is very important!
});