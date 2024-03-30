var port = browser.runtime.connect({
    name: "Sample Communication"
});

function loaded() {
    port.postMessage("get-stuff");
    port.onMessage.addListener(function(msg) {
        console.log("message received yea: ", msg);
        browser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
            selectedId = tabs[0].id;
            listListeners(msg.listeners[selectedId]);
        }).catch(function(error) {
            console.error('Error querying tabs: ', error);
        });
    });
}

window.onload = loaded;

function listListeners(listeners) {
    var x = document.getElementById('x');
    x.parentElement.removeChild(x);
    x = document.createElement('ol');
    x.id = 'x';
    document.getElementById('h').innerText = listeners.length ? listeners[0].parent_url : '';

    for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        var el = document.createElement('li');

        var bel = document.createElement('b');
        bel.innerText = listener.domain + ' ';
        var win = document.createElement('code');
        win.innerText = ' ' + (listener.window ? listener.window + ' ' : '') + (listener.hops && listener.hops.length ? listener.hops : '');
        el.appendChild(bel);
        el.appendChild(win);

        var sel = document.createElement('span');
        if (listener.fullstack) sel.setAttribute('title', listener.fullstack.join("\n\n"));
        var seltxt = document.createTextNode(listener.stack);
        sel.appendChild(seltxt);
        el.appendChild(sel);

        var pel = document.createElement('pre');
        pel.innerText = listener.listener;
        el.appendChild(pel);

        x.appendChild(el);
    }
    document.getElementById('content').appendChild(x);
}
