document.getElementById("scan-feed").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(tab.id, { action: "start-scan" });
    });
  });
  
  function scanCurrentFeed() {
    // shudofkld communicate with content.js or directly call fashapi
    alert("Scanning feed...");
  }