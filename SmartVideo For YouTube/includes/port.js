var port = (function() {
    var emptyFn = function() { return (function() {}); };
    
    var guid = function() {
        var S4 = function (){
            return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
        };
        return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
    };

    var mbrowser = {
        extension: {
            type: "chrome", 
        },
        tabs: {
            current: {
                id: guid()
            },
            injectSequential: function(list, callback) {
                callback = callback || emptyFn;
                var nextIndex = -1;
                var me = this;
                var cb = function(success) {
                    if(!success) {
                        console.error("could not inject " + list[nextIndex].url + " on page " + window.location.href + ". Returning.");
                        callback(false);
                        return;
                    }
                    nextIndex++;
                    if(list.length <= nextIndex) {
                        callback(true);
                        return;
                    }
                    me.inject(list[nextIndex], cb);
                };
                cb(true);
            },
            inject: function(file, callback) {
                callback = callback || emptyFn;
                var url = file.url;
                var type = file.type;
                var par = document.getElementsByTagName("head")[0] || document.body || document.documentElement;
                var toInject;
                if(type == "script") {
                    toInject = document.createElement("script");
                    toInject.setAttribute("src", chrome.extension.getURL(url));
                } else if(type == "style") {
                    toInject = document.createElement("link");
                    toInject.setAttribute("href", chrome.extension.getURL(url));
                    toInject.setAttribute("rel", "stylesheet");
                    toInject.setAttribute("type", "text/css");
                }
                toInject.onload = function() {
                    callback(true);
                };
                toInject.onerror = function() {
                    callback(false);
                };
                par.appendChild(toInject);
            }
        }
    };
    
    return ({
        init: emptyFn,
        mbrowser: mbrowser
    });
})();

port.init();
var mbrowser = port.mbrowser;