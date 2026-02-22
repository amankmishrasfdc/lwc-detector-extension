document.getElementById("scanBtn").addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes("lightning.force.com")) {
        alert("Open a Salesforce Lightning page first.");
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scanForLwc
    }).then((results) => {

        const components = results[0].result;
        const resultList = document.getElementById("result");
        resultList.innerHTML = '';

        if (!components || components.length === 0) {
            resultList.innerHTML = '<li>No custom LWC found</li>';
            return;
        }

        components.forEach(comp => {
            const li = document.createElement('li');
            li.textContent = comp;
            resultList.appendChild(li);
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

        // ONLY custom components
        if (tagName.startsWith('c-')) {
            lwcComponents.add(tagName);
        }
    });

    return Array.from(lwcComponents);
}