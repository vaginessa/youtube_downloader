(function(global) {	
    var MyTube = function() {
        var chrome;
        var mbrowser;
            
        var prefs = {
            common: {},
            makka: {},
            embeded: {},
            playlistOverrides: {}
        };
        
        var bundle = {};
        
        var prefsMeta = {
            playlistOverrides: ["enableOverrides", "enable", "autoPlay", "autoBuffer", "autoPlayOnBuffer", "autoPlayOnBufferPercentage", "autoPlayOnSmartBuffer", "saveBandwidth"],
            common: ["desktopNotification", "soundNotification", "logLevel"],
            makka: ["enable", "loop", "hidePopup", "autoPlay", "autoBuffer", "autoPlayOnBuffer", "autoPlayOnBufferPercentage", "autoPlayOnSmartBuffer", "quality", "fshd", "onlyNotification", "saveBandwidth", "playerSize", "hideAnnotations", "turnOffPagedBuffering", "enablePageAction"],
            embeded: ["enable", "loop", "hidePopup", "autoPlay", "autoBuffer", "autoPlayOnBuffer", "autoPlayOnBufferPercentage", "autoPlayOnSmartBuffer", "quality", "fshd", "onlyNotification", "enableFullScreen", "saveBandwidth", "hideAnnotations", "turnOffPagedBuffering"],
            meta: {
                "enable": {
                    type: 1,
                    name: "enable",
                    defaultVal: {
                        embeded: true,
                        makka: true,
                        playlistOverrides: true,
                    }
                },
                "enableOverrides": {
                    type: 1,
                    name: "enableoverrides",
                    defaultVal: false,
                },
                "loop": {
                    type: 1,
                    name: "loop",
                    defaultVal: false
                },
                "hidePopup": {
                    type: 1,
                    name: "hidepopup",
                    defaultVal: false
                },
                "autoPlay": {
                    type: 1,
                    name: "autoplay",
                    defaultVal: {
                        embeded: false,
                        makka: false,
                        playlistOverrides: true
                    }
                },
                "autoBuffer": {
                    type: 1,
                    name: "autobuffer",
                    defaultVal: false
                },
                "autoPlayOnBuffer": {
                    type: 1,
                    name: "autoplayonbuffer",
                    defaultVal: false
                },
                "autoPlayOnBufferPercentage": {
                    type: 2,
                    name: "autoplayonbufferpercentage",
                    defaultVal: 42
                },
                "autoPlayOnSmartBuffer": {
                    type: 1,
                    name: "autoplayonsmartbuffer",
                    defaultVal: true
                },
                "quality": {
                    type: 3,
                    name: "quality",
                    defaultVal: "default"
                },
                "enableFullScreen": {
                    type: 1,
                    name: "enablefullscreen",
                    defaultVal: true
                },
                "fshd": {
                    type: 1,
                    name: "fshd",
                    defaultVal: {
                        embeded: false,
                        makka: true
                    }
                },
                "onlyNotification": {
                    type: 1,
                    name: "onlynotification",
                    defaultVal: false
                },
                "desktopNotification": {
                    type: 1,
                    name: "desktopnotification",
                    defaultVal: true
                },
                "soundNotification": {
                    type: 1,
                    name: "soundnotification",
                    defaultVal: true
                },
                "saveBandwidth": {
                    type: 1,
                    name: "savebandwidth",
                    defaultVal: false
                },
                "playerSize": {
                    type: 3,
                    name: "playersize",
                    defaultVal: "default"
                },
                "hideAnnotations": {
                    type: 1,
                    name: "hideannotations",
                    defaultVal: false
                },
                "turnOffPagedBuffering": {
                    type: 1,
                    name: "turnoffpagedbuffering",
                    defaultVal: false
                },
                "logLevel": {
                    type: 2,
                    name: "loglevel",
                    defaultVal: 0
                },
                "enablePageAction": {
                    type: 1,
                    name: "enablepageaction",
                    defaultVal: false
                }
            }
        };
        
        var initPrefs = function() {
            var fn = function(key, prefs) {
                var l = prefsMeta[key];
                for (var i = 0; i < l.length; i++) {
                    var prefName = l[i];
                    var meta = prefsMeta.meta[prefName];
                    var name = meta.name;
                    var type = meta.type;
                    var val = mbrowser.extension.prefs.get(key + "-" + name);
                    if (val) {
                        if (type == 1) {
                            val = (val == "true");
                        } else if (type == 2) {
                            val = Number(val);
                        } else if (type == 3) {}
                    } else {
                        val = meta.defaultVal;
                        if (val instanceof Object) {
                            val = val[key];
                        }
                    }
                    prefs[prefName] = val;
                }
            };
            for (var i in prefs) {
                fn(i, prefs[i]);
            }
        };
        
        var savePrefs = function(p) {
            if (!p) {
                return;
            }
            for (var key in p) {
                var o = p[key];
                var acceptablePrefs = prefsMeta[key];
                if (acceptablePrefs == null) {
                    continue;
                }
                var pp = prefs[key];
                for (var i in o) {
                    if (acceptablePrefs.indexOf(i) == -1) {
                        continue;
                    }
                    var meta = prefsMeta.meta[i];
                    if (!meta) {
                        continue;
                    }
                    var val = o[i];
                    var type = meta.type;
                    if (type == 1) {
                        if (typeof val != "boolean") {
                            continue;
                        }
                    } else if (type == 2) {
                        if (typeof val != "number") {
                            continue;
                        }
                    } else if (type == 3) {
                        if (typeof val != "string") {
                            continue;
                        }
                    }
                    var name = meta.name;
                    mbrowser.extension.prefs.save(key + "-" + name, String(val));
                    pp[i] = val;
                }
            }
        };
        
        var extensionEventListeners = {
            relayPrefs: function(request, sender, sendResponse) {
                sendResponse({
                    type: "prefs",
                    prefs: prefs,
                    bundle: request.loadBundle ? bundle: null,
                });
            },
            savePrefs: function(request, sender, sendResponse) {
                sendResponse({});
                savePrefs(request.prefs);
                mbrowser.tabs.broadcastMessage({
                    type: "preferencesUpdated",
                    prefs: prefs,
                    savedBy: request.savedBy
                });
            },
            showPrefs: function(request, sender, sendResponse) {
                sendResponse({});
                mbrowser.extension.showPrefsWindow();
            },
            notify: function(request, sender, sendResponse) {
                sendResponse({});
                var p = prefs.common;
                if (p.soundNotification) {
                    mbrowser.extension.audioNotification();
                }
            },
            hidePageAction: function(request, sender, sendResponse) {
                sendResponse({});
                var tabId = sender.tab ? sender.tab.id : null;
                if(!tabId) {
                    return;
                }
                mbrowser.pageAction.hide(tabId);
            },
            showPageAction: function(request, sender, sendResponse) {
                sendResponse({});
                var tabId = sender.tab ? sender.tab.id : null;
                if(!tabId) {
                    return;
                }
                mbrowser.pageAction.show(tabId, request.enabled);
            },
            "default": function(request, sender, sendResponse) {
                sendResponse({});
            }
        };
        
        var initListeners = function() {
            chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
                var type = request.type;
                var action = extensionEventListeners[type] || extensionEventListeners["default"];
                action(request, sender, sendResponse);
            });
            mbrowser.pageAction.onClicked.addListener(function(tab) {
                chrome.tabs.sendMessage(tab.id, {
                    type: "pageActionClicked"
                },
                function(response) {});
            });
        };
        
        var initBundle = function(tabBundleKeys) {
            for (var i = 0, len = tabBundleKeys.length; i < len; i++) {
                var key = tabBundleKeys[i];
                var value = chrome.i18n.getMessage(key);
                if(!value) {
                    throw "No bundle found for key " + key;
                }
                bundle[key] = value;
            }
            bundle["extension_id"] = chrome.i18n.getMessage("@@extension_id");
        };
        return ({
            init: function(chrm, mbrwsr, tabBundleKeys) {
                chrome = chrm;
                mbrowser = mbrwsr;
                initPrefs();
                initBundle(tabBundleKeys);
                initListeners();
            }
        });
    } ();

    global.MyTube = MyTube;
})(exports);
