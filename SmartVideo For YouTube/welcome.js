(function() {
    var onReady = function() {
    document.getElementById("settings-span").addEventListener("click", function() {
        chrome.extension.sendMessage({type: "showPrefs"});
    }, false);
    };

    if (window.document.readyState == "complete") {
        onReady();
    } else {
        document.addEventListener("DOMContentLoaded", onReady, false);
    }
})();