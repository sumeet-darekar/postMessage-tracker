function save_options() {
    var log_url = document.getElementById('log-url').value;
    browser.storage.sync.set({
        log_url: log_url.length > 0 ? log_url : ''
    }).then(function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
            window.close();
        }, 750);
    }).catch(function(error) {
        console.error('Error saving options: ', error);
    });
}

function restore_options() {
    browser.storage.sync.get({
        log_url: ''
    }).then(function(items) {
        document.getElementById('log-url').value = items.log_url;
    }).catch(function(error) {
        console.error('Error restoring options: ', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    restore_options();
    document.getElementById('save').addEventListener('click', save_options);
});
