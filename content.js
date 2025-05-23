const apiUrl = "http://localhost:8000/xxxx"; // avaksfagskalvanlk

const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js";
document.head.appendChild(script);

script.onload = () => {
    console.log("Tesseract loaded");
  };

// fucking scan it
const scanPosts = async () => {
  const posts = [...document.querySelectorAll("div")].map(div => div.innerText).filter(t => t.length > 30);

  for (const post of posts) {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: post })
    });

    const result = await res.json();
    if (result.flagged) {
      highlightPost(post, result.reason);
    }
  }
};

// highlight anda then badge flagged content
const highlightPost = (text, reason) => {
  const nodes = [...document.querySelectorAll("div")].filter(n => n.innerText.includes(text));
  nodes.forEach(node => {
    node.style.border = "2px solid red";
    node.style.position = "relative";

    const badge = document.createElement("div");
    badge.innerText = `⚠️ ${reason}`;
    badge.style.position = "absolute";
    badge.style.top = "0";
    badge.style.right = "0";
    badge.style.backgroundColor = "red";
    badge.style.color = "white";
    badge.style.padding = "4px 8px";
    badge.style.zIndex = 9999;
    badge.style.fontSize = "12px";
    badge.style.fontWeight = "bold";
    badge.style.borderBottomLeftRadius = "6px";
    badge.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
    if (!node.querySelector(".budol-flag")) {
      badge.classList.add("budol-flag");
      node.appendChild(badge);
    }
  });
};

// scan image text using O fucking CR (9ocr)
const scanImagesWithOCR = async () => {
    const suspiciousKeywords = ["donate", "help", "injury", "crying", "biktima", "awa"];
  
    const images = document.querySelectorAll("img");
    for (const img of images) {
      try {
        const result = await Tesseract.recognize(img.src, "eng");
        const extractedText = result.data.text.trim().toLowerCase();
  
        if (extractedText.length > 10) {
          console.log(`OCR Text from image:`, extractedText);
  
          const matched = suspiciousKeywords.find(word => extractedText.includes(word));
          if (matched) {
            img.style.border = "2px solid orange";
            img.title = `⚠️ OCR keyword matched: ${matched}`;
  
            const badge = document.createElement("div");
            badge.innerText = `⚠️ OCR: "${matched}" detected`;
            badge.style.position = "absolute";
            badge.style.top = "0";
            badge.style.right = "0";
            badge.style.backgroundColor = "orange";
            badge.style.color = "white";
            badge.style.padding = "4px 8px";
            badge.style.zIndex = 9999;
            badge.style.fontSize = "12px";
            badge.style.fontWeight = "bold";
            badge.style.borderBottomLeftRadius = "6px";
            badge.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
  
            // Ensure wrapper for image
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            wrapper.appendChild(badge);
          }
        }
      } catch (err) {
        console.warn("OCR failed for image:", img.src);
      }
    }
  };

window.scanBudolContent = () => {
  scanPosts();
  scanImagesWithOCR();
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start-scan") {
      console.log("📣 Received scan trigger from popup");
      scanBudolContent();
    }
  });