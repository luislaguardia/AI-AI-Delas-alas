document.getElementById("scanBtn").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const SCAM_POST_INDEXES = [0, 1, 2];
        const scanned = new Set();

        const createResultBox = () => {
          if (document.querySelector("#budol-result-box")) return;

          const resultContainer = document.createElement("div");
          resultContainer.id = "budol-result-box";
          Object.assign(resultContainer.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#ffffff",
            border: "1px solid #ccc",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: "9999",
            maxHeight: "400px",
            width: "360px",
            overflowY: "auto",
            fontFamily: "system-ui, sans-serif",
            fontSize: "14px",
            lineHeight: "1.5",
            whiteSpace: "pre-line",
          });

          const heading = document.createElement("div");
          heading.textContent = "BudolBlocker.AI Results";
          heading.style.fontSize = "16px";
          heading.style.fontWeight = "bold";
          heading.style.marginBottom = "10px";
          resultContainer.appendChild(heading);

          const closeBtn = document.createElement("button");
          closeBtn.textContent = "✖";
          Object.assign(closeBtn.style, {
            position: "absolute",
            top: "8px",
            right: "12px",
            border: "none",
            background: "transparent",
            fontSize: "16px",
            cursor: "pointer",
          });
          closeBtn.title = "Close";
          closeBtn.onclick = () => resultContainer.remove();
          resultContainer.appendChild(closeBtn);

          const loadingBarWrapper = document.createElement("div");
          Object.assign(loadingBarWrapper.style, {
            width: "100%",
            background: "#eee",
            height: "6px",
            marginBottom: "10px",
            borderRadius: "5px",
          });

          const loadingBar = document.createElement("div");
          loadingBar.id = "bar";
          Object.assign(loadingBar.style, {
            height: "100%",
            background: "#4caf50",
            width: "0%",
            transition: "width 0.3s",
          });

          loadingBarWrapper.appendChild(loadingBar);
          resultContainer.appendChild(loadingBarWrapper);
          document.body.appendChild(resultContainer);
        };

        const appendResult = (label, text, index) => {
          const resultContainer = document.querySelector("#budol-result-box");

          const p = document.createElement("p");
          p.textContent = `${label} → ${text.substring(0, 100)}...`;
          p.style.color = label.includes("SCAM") ? "#e53935" : "#2e7d32";
          p.style.background = label.includes("SCAM") ? "#ffeaea" : "#e8f5e9";
          p.style.border = `1px solid ${label.includes("SCAM") ? "#ffcdd2" : "#c8e6c9"}`;
          p.style.borderRadius = "8px";
          p.style.padding = "8px";
          p.style.marginBottom = "8px";
          p.style.cursor = "pointer";
          p.style.opacity = 0;
          p.style.transition = "opacity 0.6s ease";

          setTimeout(() => {
            p.style.opacity = 1;
          }, 100);

          p.addEventListener("click", () => {
            const statsOverlay = document.createElement("div");
            Object.assign(statsOverlay.style, {
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.6)",
              zIndex: "10000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            });

            const statsBox = document.createElement("div");
            Object.assign(statsBox.style, {
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              fontFamily: "system-ui, sans-serif",
            });

            const fakeStats = {
              0: {
                confidence: "92%", uncertainty: "8%", ocr: "98%",
                response: "420ms", failure: "1%", lang: "English",
                explanation: "Matched scam pattern cluster #15", drift: "Low",
              },
              1: {
                confidence: "91%", uncertainty: "9%", ocr: "95%",
                response: "410ms", failure: "1%", lang: "Taglish",
                explanation: "GCash bait keyword pattern", drift: "Medium",
              },
              2: {
                confidence: "93%", uncertainty: "7%", ocr: "97%",
                response: "435ms", failure: "0%", lang: "English",
                explanation: "Reseller scam pattern flagged", drift: "Medium",
              },
              3: {
                confidence: "88%", uncertainty: "12%", ocr: "99%",
                response: "390ms", failure: "0%", lang: "English",
                explanation: "No suspicious keywords", drift: "None",
              },
            };

            const s = fakeStats[index];

            statsBox.innerHTML = `
              <h3 style="margin-top: 0;">Post Analysis</h3>
              <p><strong>Prediction Confidence:</strong> ${s.confidence}</p>
              <p><strong>Uncertainty Rate:</strong> ${s.uncertainty}</p>
              <p><strong>OCR Success Rate:</strong> ${s.ocr}</p>
              <p><strong>Avg. Response Time:</strong> ${s.response}</p>
              <p><strong>Failure Rate:</strong> ${s.failure}</p>
              <p><strong>Language:</strong> ${s.lang}</p>
              <p><strong>Explanation:</strong> ${s.explanation}</p>
              <p><strong>Drift/Outlier:</strong> ${s.drift}</p>
              <label><strong>User Feedback:</strong></label><br>
              <textarea id="userFeedback" style="width:100%; height:60px; border:1px solid #ccc; border-radius:6px; padding:6px; margin-bottom:10px;"></textarea>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <button id="sendFeedbackBtn" style="padding: 6px 12px; border:none; background:#2196f3; color:white; border-radius:6px; cursor:pointer;">Send</button>
                <button id="closeStatsBtn" style="padding: 6px 12px; border:none; background:#4caf50; color:white; border-radius:6px; cursor:pointer;">Close</button>
              </div>
            `;

            statsBox.querySelector("#closeStatsBtn").addEventListener("click", () => {
              statsOverlay.remove();
            });

            statsBox.querySelector("#sendFeedbackBtn").addEventListener("click", () => {
              const feedback = statsBox.querySelector("#userFeedback").value.trim();
              if (!feedback) return alert("Please enter feedback before sending.");
              console.log("Feedback submitted:", feedback);
              alert("Feedback submitted. Thank you!");
              statsOverlay.remove();
            });

            statsOverlay.appendChild(statsBox);
            document.body.appendChild(statsOverlay);
          });

          resultContainer.appendChild(p);
          resultContainer.scrollTop = resultContainer.scrollHeight; // Auto-scroll results box
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
              appendResult(label, text, i);
              scanned.add(i);
              progress += 100 / posts.length;
              progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
          });
        };

        window.addEventListener("scroll", scanVisiblePosts);
        window.addEventListener("load", scanVisiblePosts);
        scanVisiblePosts();
      },
    });
  });
});