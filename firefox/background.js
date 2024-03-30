var tab_listeners = {};
var tab_push = {}, tab_lasturl = {};
var selectedId = -1;

function refreshCount() {
    var txt = tab_listeners[selectedId] ? tab_listeners[selectedId].length : 0;
    browser.tabs.get(selectedId).then(function(tabInfo) {
        browser.browserAction.setBadgeText({ text: txt.toString(), tabId: selectedId });
        if (txt > 0) {
            browser.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255], tabId: selectedId });
        } else {
            browser.browserAction.setBadgeBackgroundColor({ color: [0, 0, 255, 0], tabId: selectedId });
        }
    }).catch(function(error) {
        console.error(error);
    });
}

function logListener(data) {
    browser.storage.sync.get({
        log_url: ''
    }).then(function(items) {
        var log_url = items.log_url;
        if (!log_url.length) return;
        data = JSON.stringify(data);
        try {
            fetch(log_url, {
                method: 'post',
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: data
            });
        } catch (e) {
            console.error(e);
        }
    }).catch(function(error) {
        console.error(error);
    });
}

browser.runtime.onMessage.addListener(function(msg, sender) {
    console.log('message from cs', msg);
    var tabId = sender.tab.id;
    if (msg.listener) {
        if (msg.listener == 'function () { [native code] }') return;
        msg.parent_url = sender.tab.url;
        if (!tab_listeners[tabId]) tab_listeners[tabId] = [];
        tab_listeners[tabId].push(msg);
        logListener(msg);
    }
    if (msg.pushState) {
        tab_push[tabId] = true;
    }
    if (msg.changePage) {
        delete tab_lasturl[tabId];
    }
    if (msg.log) {
        console.log(msg.log);
    } else {
        refreshCount();
    }
});

browser.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    console.log(changeInfo);
    if (changeInfo.status == "complete") {
        if (tabId == selectedId) refreshCount();
    } else if (changeInfo.status) {
        if (tab_push[tabId]) {
            delete tab_push[tabId];
        } else {
            if (!tab_lasturl[tabId]) {
                tab_listeners[tabId] = [];
            }
        }
    }
    if (changeInfo.status == "loading") {
        tab_lasturl[tabId] = true;
    }
});

browser.tabs.onActivated.addListener(function(activeInfo) {
    selectedId = activeInfo.tabId;
    refreshCount();
});

browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
    selectedId = tabs[0].id;
    refreshCount();
});

browser.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        port.postMessage({ listeners: tab_listeners });
    });
});
