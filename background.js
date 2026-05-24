// Handles background tasks (keep this simple for now)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Web Summarizer Extension Installed');
});