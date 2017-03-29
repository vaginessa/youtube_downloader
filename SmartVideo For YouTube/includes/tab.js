(function() {
    var tabInfo = function() {
        var o = {};
        var href = window.location.href;
        
        if(href.indexOf("http://") != 0 && href.indexOf("https://") != 0) {
            o.enable = false;
            return o;
        }
        
        //well i dont wanna screw up acid test :)
        if(href.indexOf("acid3.acidtests.org") > -1) {
            o.enable = false;
            return o;
        }
        
        var regex = /^(?:(?:http|https):\/\/)?(?:www\.)?.*?youtube\.com\/(?:editor|tv|my_videos_edit)/i;
        if(regex.test(href)) {
            o.enable = false;
            return o;
        }
        
        o.enable = true;
        
        if(window.parent != window) { //frame.
            return o;
        }
        
        regex = /^((http|https):\/\/)?(www\.)?youtube\.com\//i;
        var youTubeMakka = o.youTubeMakka = regex.test(href);
        
        o.playlist = youTubeMakka && href.indexOf("&list=") > -1;
        
        regex = /^(?:(?:http|https):\/\/)?(?:www\.)?.*?youtube\.com\/embed\//i;
        o.youTubeFrame = regex.test(href);
        
        return o;
    }();
    
    if(!tabInfo.enable) {
        return;
    }
    
    var resultantPrefs;
    var bundle;
    
    var copyAll = function(to, from, override) {
        if(from == null) {
            return;
        }
        for(var i in from) {
            if(override === false && to.hasOwnProperty(i)) {
                continue;
            }
            to[i] = from[i];
        }
    };
    var getAppropriatePrefsForTab = function(prefs) {
        var o = {};
        copyAll(o, prefs.common);
        if(tabInfo.youTubeMakka && !tabInfo.youTubeFrame) {
            copyAll(o, prefs.makka);
            if(!tabInfo.playlist) {
                return o;
            }
            if(prefs.playlistOverrides.enableOverrides) {
                copyAll(o, prefs.playlistOverrides);
            }
            return o;
        }
        copyAll(o, prefs.embeded);
        return o;
    };
    
    var fn = function() {
        var extensionEventListeners = {
            preferencesUpdated: function(request, sender, sendResponse) {
                sendResponse({});
                var prefs = getAppropriatePrefsForTab(request.prefs);
                resultantPrefs = prefs;
                MyTubeTabCommunicator.relayToPage("preferencesUpdated", {
                    prefs: prefs
                });
                showHidePageAction(prefs);
            },
            pageActionClicked: function(request, sender, sendResponse) {
                sendResponse({});
                pageActionEnabled = !pageActionEnabled;
                updatePageAction();          
                MyTubeTabCommunicator.relayToPage("pageActionClicked", {enabled: pageActionEnabled});
            },
            "default": function(request, sender, sendResponse) {
                sendResponse({});
            }
        };
        
        chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            var type = request.type;
            var action = extensionEventListeners[type] || extensionEventListeners["default"];
            action(request, sender, sendResponse);
        });
        
        
        var pageActionEnabled = false;
        var initPageAction = function(prefs) {
            pageActionEnabled = prefs.loop;
            showHidePageAction(prefs);
        };
        
        var pageActionVisible = false;
        var showHidePageAction = function(prefs) {
            var visible = !!prefs.enablePageAction;
            if(visible === pageActionVisible) {
                return;
            }
            pageActionVisible = visible;
            if(pageActionVisible) {
                chrome.extension.sendMessage({type: "showPageAction", enabled: pageActionEnabled});
                return;
            }
            chrome.extension.sendMessage({type: "hidePageAction", enabled: pageActionEnabled});
        };

        var updatePageAction = function() {
            if(!pageActionVisible) {
                return;
            }
            chrome.extension.sendMessage({type: "showPageAction", enabled: pageActionEnabled});
            return;
        };

        var domEventRelayListeners = {
            relayPrefs: function(data) {
                MyTubeTabCommunicator.relayToPage("preferencesUpdated", {
                        bundle: data.loadBundle ? bundle : null,
                        prefs: resultantPrefs
                });
                initPageAction(resultantPrefs);
            },
            notify: function() {
                chrome.extension.sendMessage({type: "notify"});
            },
            showPrefsWindow: function() {
                chrome.extension.sendMessage({type: "showPrefs"});
            },
            userAction: function(data) {
                if(data.action != "loop") {
                    return;
                }
                pageActionEnabled = !!data.data.val;
                updatePageAction();
            },
            "default": function(data) {
                
            }
        };
        
        var MyTubeTabCommunicator = function() {
            var listnerEvent = "myTubeRelayToTab";
            var senderEvent = "myTubeRelayToPage";
            
            var senderId = "myTubeRelayElementToPage";
            
            var getSenderEl = function() {
                return document.getElementById(senderId);
            };
            
            var init = function() {
                document.addEventListener(listnerEvent, function(e) {
                    var el = e.target;
                    var event = el.getAttribute("event");
                    var data = el.getAttribute("data");
                    if(data == null || data == "") {
                        data = {};
                    } else {
                        data = JSON.parse(data);
                    }
                    var action = domEventRelayListeners[event] || domEventRelayListeners["default"];
                    action(data);
                }, false);
            };
            
            var relayToPage = function(event, data) {
                data = data || {};
                var el = getSenderEl();
                if(!el) {
                    return;
                }
                el.setAttribute("event", event);
                el.setAttribute("data", JSON.stringify(data));
                var evt = el.ownerDocument.createEvent("Events");
                evt.initEvent(senderEvent, true, false);
                el.dispatchEvent(evt);
            };
            
            init();
            
            var o = {
                relayToPage: function(event, data) {
                    relayToPage(event, data);
                }
            };
            
            return o;
        }();
        
        var toInject = [{
            url: "mytube.css",
            type: "style"
        }, {
            url: "mutationObserver.js",
            type: "script"
        }, {
            url: "mytube.js",
            type: "script"
        }];
        mbrowser.tabs.injectSequential(toInject);
    };

    chrome.extension.sendMessage({type: "relayPrefs", loadBundle: true}, function(response) {
        if(!response) {
            return;
        }
        var prefs = getAppropriatePrefsForTab(response.prefs);
        resultantPrefs = prefs;
        bundle = response.bundle;
        if(prefs.enable) {
            fn();
        }
    });
})();
