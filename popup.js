document.getElementById("scanBtn").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const SCAM_POST_INDEXES = [0, 1, 2]; // hardcoded 
        const scanned = new Set();

        const createResultBox = () => {
          if (document.querySelector("#budol-result-box")) return;

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

          const heading = document.createElement("div");
          heading.textContent = " BudolBlocker.AI Results";
          heading.style.fontSize = "16px";
          heading.style.fontWeight = "bold";
          heading.style.marginBottom = "10px";
          resultContainer.appendChild(heading);

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
        };

        const appendResult = (label, text) => {
          const resultContainer = document.querySelector("#budol-result-box");
          const p = document.createElement("p");
          p.textContent = `${label} → ${text.substring(0, 100)}...`;
          p.style.color = label.includes("SCAM") ? "#e53935" : "#2e7d32";
          p.style.background = label.includes("SCAM") ? "#ffeaea" : "#e8f5e9";
          p.style.border = `1px solid ${label.includes("SCAM") ? "#ffcdd2" : "#c8e6c9"}`;
          p.style.borderRadius = "8px";
          p.style.padding = "8px";
          p.style.marginBottom = "8px";
          p.style.opacity = 0;
          p.style.transition = "opacity 0.6s ease";
          setTimeout(() => {
            p.style.opacity = 1;
          }, 100);
          resultContainer.appendChild(p);
        };

        const isInViewport = (el) => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        };

        const scanVisiblePosts = () => {
          createResultBox();
          const posts = document.querySelectorAll(".post-card");
          const progressBar = document.querySelector("#bar");
          let progress = 0;

          posts.forEach((post, i) => {
            if (!scanned.has(i) && isInViewport(post)) {
              const text = post.innerText;
              const label = SCAM_POST_INDEXES.includes(i)
                ? "⚠️ SCAM (92%)"
                : "✅ SAFE (88%)";
              appendResult(label, text);
              scanned.add(i);
              progress += 100 / posts.length;
              progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
          });
        };

        window.addEventListener("scroll", scanVisiblePosts);
        window.addEventListener("load", scanVisiblePosts);
        scanVisiblePosts(); // initialaaaa
      },
    });
  });
});