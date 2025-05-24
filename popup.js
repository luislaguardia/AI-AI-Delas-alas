document.getElementById("scanBtn").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const SUSPICIOUS_KEYWORDS = [
          "gcash", "easy money", "click here", "free load", "paluwagan", "investment",
          "pay now", "limited offer", "giveaway", "claim reward", "frontrow", "bitcoin", "crypto",
          "earn fast", "referral bonus", "loan approval", "unlock phone", "sms reward",
          "urgent", "cash out", "₱1000", "₱5000", "too good to be true",
          "binary trading", "work from home", "sideline income", "dropshipping", "pyramid scheme",
          "fast ROI", "instant cash", "VIP access", "exclusive deal", "mabilis yumaman",
          "sure profit", "double your money", "load wallet", "unli load", "no invite needed",
          "reseller package", "franchise now", "pay first", "pay now", "limited slots",
          "magic link", "crypto payout", "buy signal", "crypto alert", "VIP group",
          "e-wallet hack", "cash hack", "frontrow legit", "legit to", "proof of payout",
          "payout screenshot", "claim now", "limited time only"
        ];

        const AFFILIATE_PATTERNS = [
          "ref=", "aff=", "affiliate=", "utm_source=affiliate", "clickid=", "invite=", "trackid=",
          "bit.ly", "lnk.bio", "trk.", "go.aff", "redirect", "adf.ly", "t.co", "shope.ee",
          "tinyurl.com", "cutt.ly", "rebrand.ly", "rb.gy", "smarturl.it", "grabify.link",
          "cashinyourwallet.", "getrich.", "frontrow.", "axieinfinity.com/invite", "invitecode",
          "cashout", "redirect.php", "external.php", "out.php", "r?=", "link?ref", "redir?to="
        ];

        // Reset previous highlights
        document.querySelectorAll(".budol-flagged").forEach(el => {
          el.style.outline = "";
          el.classList.remove("budol-flagged");
        });
        const prevBox = document.querySelector("#budol-result-box");
        if (prevBox) prevBox.remove();

        const postElements = [...document.querySelectorAll("div, p, span")];
        const results = [];

        postElements.forEach((el, index) => {
          const text = el.innerText?.trim() || "";
          const lower = text.toLowerCase();

          const keywordMatches = SUSPICIOUS_KEYWORDS.filter(keyword =>
            lower.includes(keyword)
          );

          const links = [...el.querySelectorAll("a[href]")].map(a => a.href.toLowerCase());
          const linkMatches = links.filter(href =>
            AFFILIATE_PATTERNS.some(pattern => href.includes(pattern))
          );

          // Detect if an image is clickable (link wrapped around <img>)
          const linkedImages = [...el.querySelectorAll("a")].filter(a => a.querySelector("img"));
          const imageLinkMatches = linkedImages.map(a => a.href.toLowerCase())
            .filter(href => AFFILIATE_PATTERNS.some(p => href.includes(p)));

          const isSuspicious = keywordMatches.length > 0 || linkMatches.length > 0 || imageLinkMatches.length > 0;

          el.classList.add("budol-flagged");
          el.style.outline = isSuspicious ? "2px solid red" : "2px solid green";

          results.push({
            index,
            label: isSuspicious ? "⚠ SCAM" : "✅ Safe",
            text: text,
            keywordMatches,
            linkMatches,
            imageLinkMatches,
          });
        });

        const createResultBox = () => {
          const container = document.createElement("div");
          container.id = "budol-result-box";
          container.style = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #fff;
            border: 1px solid #ccc;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            max-width: 360px;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            overflow-y: auto;
            max-height: 400px;
          `;

          const title = document.createElement("h4");
          title.innerText = "🕵️ BudolBlocker.AI Results";
          title.style.marginTop = "0";
          container.appendChild(title);

          const closeBtn = document.createElement("button");
          closeBtn.innerText = "✖";
          Object.assign(closeBtn.style, {
            position: "absolute",
            top: "8px",
            right: "12px",
            background: "transparent",
            border: "none",
            fontSize: "16px",
            cursor: "pointer"
          });
          closeBtn.onclick = () => container.remove();
          container.appendChild(closeBtn);

          const resetBtn = document.createElement("button");
          resetBtn.innerText = "Reset Highlights";
          Object.assign(resetBtn.style, {
            marginTop: "10px",
            padding: "6px 12px",
            background: "#757575",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          });
          resetBtn.onclick = () => {
            document.querySelectorAll(".budol-flagged").forEach(el => {
              el.style.outline = "";
              el.classList.remove("budol-flagged");
            });
            container.remove();
          };
          container.appendChild(resetBtn);

          document.body.appendChild(container);
        };

        createResultBox();

        const box = document.querySelector("#budol-result-box");

        results.forEach(r => {
          const p = document.createElement("p");
          const lines = [];

          if (r.keywordMatches.length > 0) {
            lines.push(`🧠 Text: ${r.keywordMatches.join(", ")}`);
          }
          if (r.linkMatches.length > 0) {
            lines.push(`🔗 Link(s): ${r.linkMatches.join("\n")}`);
          }
          if (r.imageLinkMatches.length > 0) {
            lines.push(`🖼️ Image links: ${r.imageLinkMatches.join("\n")}`);
          }

          p.innerText = `${r.label}: ${r.text.substring(0, 100)}...`;
          p.title = lines.join("\n") || "No suspicious patterns found";
          p.style = `
            background: ${r.label.includes("SCAM") ? "#ffeaea" : "#e8f5e9"};
            border: 1px solid ${r.label.includes("SCAM") ? "#ffcdd2" : "#c8e6c9"};
            padding: 8px;
            border-radius: 6px;
            margin-top: 8px;
            white-space: pre-wrap;
          `;
          box.appendChild(p);
        });
      },
    });
  });
});