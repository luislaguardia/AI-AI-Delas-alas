document.getElementById("scanBtn").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId },
      files: ["html2canvas.min.js"],
    }, () => {
      chrome.scripting.executeScript({
        target: { tabId },
        func: scanAndSendDivsAsImages,
      });
    });
  });
});

function scanAndSendDivsAsImages() {
  const url = "https://7487-34-53-77-193.ngrok-free.app/predict_image/";

  const resultContainer = document.createElement("div");
  resultContainer.style.position = "fixed";
  resultContainer.style.bottom = "10px";
  resultContainer.style.right = "10px";
  resultContainer.style.background = "#fff";
  resultContainer.style.border = "1px solid #000";
  resultContainer.style.padding = "10px";
  resultContainer.style.zIndex = "9999";
  resultContainer.style.maxHeight = "300px";
  resultContainer.style.overflow = "auto";
  resultContainer.innerText = "Scanning posts...";
  document.body.appendChild(resultContainer);

  const divs = [...document.querySelectorAll("div")].filter(
    (d) => d.innerText.length > 30 && d.offsetHeight > 50
  );

  divs.forEach((div, i) => {
    html2canvas(div).then((canvas) => {
      canvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append("file", blob, `post_${i}.png`);

        fetch(url, {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            const result = `[${data.label}] (${Math.round(data.confidence * 100)}%) → ${data.extracted_text.substring(0, 80)}...`;
            const p = document.createElement("p");
            p.innerText = result;
            resultContainer.appendChild(p);
          })
          .catch((err) => {
            const p = document.createElement("p");
            p.innerText = "Error: " + err.message;
            resultContainer.appendChild(p);
          });
      });
    });
  });
}