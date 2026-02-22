document.getElementById("scanBtn").addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes("lightning.force.com")) {
        alert("Open a Salesforce Lightning page first.");
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scanForLwc
    }).then((results) => {

        const components = results[0].result;
        const resultDiv = document.getElementById("result");
        const countBadge = document.getElementById("count");

        resultDiv.innerHTML = '';

        if (!components || components.length === 0) {
            resultDiv.innerHTML = `<div class="empty">No custom LWC found</div>`;
            countBadge.textContent = 0;
            return;
        }

        countBadge.textContent = components.length;

        components.forEach(comp => {
            const card = document.createElement('div');
            card.className = 'component-card';

            const name = document.createElement('span');
            name.textContent = comp;

            const copyBtn = document.createElement('button');
            copyBtn.textContent = "Copy";
            copyBtn.className = "copy-btn";
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(comp);
            };

            card.appendChild(name);
            card.appendChild(copyBtn);

            resultDiv.appendChild(card);
        });

    }).catch(err => {
        console.error(err);
    });
});

function scanForLwc() {

    const allElements = document.querySelectorAll('*');
    const lwcComponents = new Set();

    allElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();

        // Only custom LWC in default namespace
        if (tagName.startsWith('c-')) {
            lwcComponents.add(tagName);
        }
    });

    return Array.from(lwcComponents);
}