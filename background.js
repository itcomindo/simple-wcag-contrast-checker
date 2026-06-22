chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "toggle_mm_wcag" }).catch((err) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            }).then(() => {
                setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, { action: "toggle_mm_wcag" });
                }, 100);
            });
        });
    }
});
