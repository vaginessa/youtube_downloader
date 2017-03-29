(function(global) {
    var port = (function() {
        var emptyFn = function() { return (function() {}); };
        
        var focusTab = function(tab) {
            try {
                chrome.tabs.update(tab.id, {
                    selected: true
                });
                focusWindow(tab.windowId);
            } catch(ex) {}
        };
            
        var focusWindow = function(windowId) {
            try {
                chrome.windows.update(windowId, {focused: true});
            } catch(ex) {}
        };
        
        var openOrFocusTab = function(url) {
            //chrome.tabs.get throws an exception if the tab is close. So using query instead.
            chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
                var oURI = chrome.extension.getURL(url);
                tabs = tabs || [];
                for (var i = 0, len = tabs.length; i < len; i++) {
                    var tab = tabs[i];
                    if (tab.url && tab.url.indexOf(oURI) == 0) {
                        focusTab(tab);
                        return;
                    }
                }
                var tab = chrome.tabs.create({
                    url: oURI
                }, function(tab) {
                    focusWindow(tab.windowId);
                });
            });
        };
                
        var mbrowser = {
            extension: {
                type: "chrome",
                showWelcomePage: function() {
                    openOrFocusTab("welcome.html");
                },
                showPrefsWindow: function() {
                    openOrFocusTab("options.html");
                },
                prefs: {
                    get: function(key) {
                        return localStorage[key];
                    },
                    save: function(key, value) {
                        localStorage[key] = value;
                    },
                    remove: function(key) {
                        delete localStorage[key];
                    },
                    copy: function(from, to) {
                        this.save(to, this.get(from));
                    },
                    rename: function(from, to) {
                        this.save(to, this.get(from));
                        this.remove(from);
                    },
                    getVersion: function() {
                        var ver = this.get("version");
                        if(ver == null) {
                            return -1;
                        }
                        ver = Number(ver);
                        return isNaN(ver) ? -1 : ver;
                    },
                    setVersion: function(version) {
                        this.save("version", String(version));
                    }
                },
                audioNotification: function() {
                    try {
                        var el = document.getElementById("audio");
                        el.play && el.play();
                    } catch(ex) {}
                }
            },
            tabs: {
                broadcastMessage: function(data) {
                    chrome.tabs.query({}, function(tabs) {
                        for (var i = 0, len = tabs.length; i < len; i++) {
                            var tab = tabs[i];
                            chrome.tabs.sendMessage(tab.id, data);
                        }
                    });
                }
            },
            pageAction: {
                onClicked: {
                    addListener: function(listener) {
                        chrome.pageAction.onClicked.addListener(listener);
                    }
                },
                show: function(tabId, enabled) {
                    var iconName = enabled ? "repeat" : "no-repeat";
                    chrome.pageAction.setIcon({tabId: tabId, path: {
                        19: "../icons/" + iconName + "-19.png",
                        38: "../icons/" + iconName + "-38.png"
                    }});
                    chrome.pageAction.setTitle({
                        title: chrome.i18n.getMessage("page_action_title_" + (enabled ? "enabled" : "disabled")),
                        tabId: tabId
                    });
                    chrome.pageAction.show(tabId);
                },
                hide: function(tabId) {
                    chrome.pageAction.hide(tabId);
                }
            }
        };
        
        return ({
            init: emptyFn,
            chrome: chrome,
            mbrowser: mbrowser
        });
    })();
    
    global.port = port;
})(exports);