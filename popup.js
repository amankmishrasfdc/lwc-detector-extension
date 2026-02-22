// when the scan button is clicked we want to run our helper code
document.getElementById("scanBtn").addEventListener("click", async () => {

    // get the active tab in the current window
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // if there's no URL or the URL is not a lightning page show an alert
    if (!tab.url || !tab.url.includes("lightning.force.com")) {
        alert("Open a Salesforce Lightning page first.");
        return;               // stop further processing
    }

    // inject and execute the scanForLwc function in the context of the page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scanForLwc     // the function defined below will run in the page
    }).then((results) => {

        // results is an array of execution results; we only ask for one
        const components = results[0].result;

        // grab the DOM elements in our popup where we will display output
        const resultDiv = document.getElementById("result");
        const countBadge = document.getElementById("count");

        // clear any previous output
        resultDiv.innerHTML = '';

        // if the injected script returned nothing or an empty list
        if (!components || components.length === 0) {
            // show a placeholder message
            resultDiv.innerHTML = `<div class="empty">No custom LWC found</div>`;
            countBadge.textContent = 0;   // reset the badge
            return;
        }

        // update the badge with the number of components found
        countBadge.textContent = components.length;

        // create a card for each component name
        components.forEach(comp => {
            const card = document.createElement('div');
            card.className = 'component-card';

            const name = document.createElement('span');
            name.textContent = comp;

            const copyBtn = document.createElement('button');
            copyBtn.textContent = "Copy";
            copyBtn.className = "copy-btn";

            // when the copy button is clicked, copy the component name
            copyBtn.onclick = async () => {
                await navigator.clipboard.writeText(comp);

                // Visual feedback
                copyBtn.textContent = "Copied!";
                copyBtn.classList.add("copied");

                setTimeout(() => {
                    copyBtn.textContent = "Copy";
                    copyBtn.classList.remove("copied");
                }, 1500);
            };copyBtn.onclick = async () => {
                await navigator.clipboard.writeText(comp);

                // Visual feedback
                copyBtn.textContent = "Copied!";
                copyBtn.classList.add("copied");

                setTimeout(() => {
                    copyBtn.textContent = "Copy";
                    copyBtn.classList.remove("copied");
                }, 1500);
            };
            // assemble the card and append it to the result container
            card.appendChild(name);
            card.appendChild(copyBtn);

            resultDiv.appendChild(card);
        });

    }).catch(err => {
        // log any errors that occurred while executing the script
        console.error(err);
    });
});

// this function will be serialized and executed inside the page
// it scans the document for custom LWC tags (those that start with "c-")
function scanForLwc() {

    // select every element in the DOM
    const allElements = document.querySelectorAll('*');
    // use a Set to avoid duplicates
    const lwcComponents = new Set();

    allElements.forEach(el => {
        const tagName = el.tagName.toLowerCase();

        // Only custom LWC in default namespace: tag names start with "c-"
        if (tagName.startsWith('c-')) {
            lwcComponents.add(tagName);
        }
    });

    // return an array of the unique component names
    return Array.from(lwcComponents);
}