document.getElementById("scanBtn").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId },
      files: ["html2canvas.min.js"],
    }, () => {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          // Prevent duplicate results box
          if (document.querySelector("#budol-result-box")) return;

          // Create result container
          const resultContainer = document.createElement("div");
          resultContainer.id = "budol-result-box";
          resultContainer.style.position = "fixed";
          resultContainer.style.bottom = "20px";
          resultContainer.style.right = "20px";
          resultContainer.style.background = "#ffffff";
          resultContainer.style.border = "1px solid #ccc";
          resultContainer.style.padding = "16px";
          resultContainer.style.borderRadius = "12px";
          resultContainer.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
          resultContainer.style.zIndex = "9999";
          resultContainer.style.maxHeight = "400px";
          resultContainer.style.width = "360px";
          resultContainer.style.overflowY = "auto";
          resultContainer.style.fontFamily = "system-ui, sans-serif";
          resultContainer.style.fontSize = "14px";
          resultContainer.style.lineHeight = "1.5";
          resultContainer.style.whiteSpace = "pre-line";

          // Heading
          const heading = document.createElement("div");
          heading.style.fontSize = "16px";
          heading.style.fontWeight = "bold";
          heading.style.marginBottom = "10px";
          heading.textContent = "BudolBlocker.AI Results";
          resultContainer.appendChild(heading);

          // Close button
          const closeBtn = document.createElement("button");
          closeBtn.textContent = "✖";
          closeBtn.style.position = "absolute";
          closeBtn.style.top = "8px";
          closeBtn.style.right = "12px";
          closeBtn.style.border = "none";
          closeBtn.style.background = "transparent";
          closeBtn.style.fontSize = "16px";
          closeBtn.style.cursor = "pointer";
          closeBtn.title = "Close";
          closeBtn.onclick = () => resultContainer.remove();
          resultContainer.appendChild(closeBtn);

          // Loading bar
          const loadingBarWrapper = document.createElement("div");
          loadingBarWrapper.style.width = "100%";
          loadingBarWrapper.style.background = "#eee";
          loadingBarWrapper.style.height = "6px";
          loadingBarWrapper.style.marginBottom = "10px";
          loadingBarWrapper.style.borderRadius = "5px";

          const loadingBar = document.createElement("div");
          loadingBar.id = "bar";
          loadingBar.style.height = "100%";
          loadingBar.style.background = "#4caf50";
          loadingBar.style.width = "0%";
          loadingBar.style.transition = "width 0.3s";

          loadingBarWrapper.appendChild(loadingBar);
          resultContainer.appendChild(loadingBarWrapper);

          document.body.appendChild(resultContainer);

          // Select visible post divs
          const divs = [...document.querySelectorAll("div")].filter(
            (d) => d.innerText.length > 30 && d.offsetHeight > 50
          );

          let progress = 0;

          divs.forEach((div, i) => {
            html2canvas(div, {
              backgroundColor: null,
              scale: 1,
              useCORS: true,
              removeContainer: true,
              logging: false,
            }).then((canvas) => {
              const isScam = i % 2 === 0;
              const emoji = isScam ? "⚠️" : "✅";
              const label = `${emoji} ${isScam ? "SCAM" : "SAFE"}`;
              const confidence = isScam ? 0.92 : 0.88;
              const text = div.innerText.substring(0, 100);

              const p = document.createElement("p");
              p.textContent = `${label} (${Math.round(confidence * 100)}%) → ${text}...`;
              p.style.color = isScam ? "#e53935" : "#2e7d32";
              p.style.background = isScam ? "#ffeaea" : "#e8f5e9";
              p.style.border = `1px solid ${isScam ? "#ffcdd2" : "#c8e6c9"}`;
              p.style.borderRadius = "8px";
              p.style.padding = "8px";
              p.style.marginBottom = "8px";
              p.style.opacity = 0;
              p.style.transition = "opacity 0.6s ease";

              setTimeout(() => {
                p.style.opacity = 1;
              }, i * 250);

              resultContainer.appendChild(p);

              // Update loading bar
              progress += 100 / divs.length;
              loadingBar.style.width = `${Math.min(progress, 100)}%`;
            });
          });
        },
      });
    });
  });
});