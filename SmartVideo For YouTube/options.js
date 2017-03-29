var common = {
    id: mbrowser.tabs.current.id,
    extensionType: mbrowser.extension.type,
    init: function(fn, scope) {
        chrome.extension.sendMessage({
            type: "relayPrefs"
        },
        function(response) {
            if(!response) {
                return;
            }
            if (response.prefs) {
                fn(response.prefs);
            }
        });
        chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            sendResponse({});
            if(request.type != "preferencesUpdated") {
                return;
            }
            if(common.id != request.savedBy) {
                window.location.reload(true);
            }
        });
    },
    getString: function(key) {
        var value = chrome.i18n.getMessage(key);
        if(!value) {
            var errorMsg = "No bundle found for key " + key;
            console.error(errorMsg);
            throw errorMsg;
        }
        return value;
    },
    savePrefs: function(prefs) {
        chrome.extension.sendMessage({
            type: "savePrefs",
            prefs: prefs,
            savedBy: this.id
        });
    },
    getURL: function(path) {
        return chrome.extension.getURL(path);
    },
    closeWindow: function() {
        window.close();
    }
};
var MyTubePrefs = {
    getSmartVideoBaseUrl: function() {
        return "http://smartvideo.ashishmishra.in"
    },
    getDonateUrl: function() {
        return this.getSmartVideoBaseUrl() + "/donate?from=" + common.extensionType;
    },
    getString: function(key) {
        return common.getString(key);
    },
    getURL: function(path) {
        return common.getURL(path);
    },
    findLabelFor: function(el) {
        var id = el.id;
        var labels = document.getElementsByTagName("label");
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (label.getAttribute("for") == id) {
                return label;
            }
        }
        return null;
    },
    findImageFor: function(el) {
        var id = el.id;
        return document.getElementById(el.id + "-img" + el.disabled ? "-disabled": "") || document.getElementById(el.id + "-img");
    },
    makkaPrefs: {},
    embededPrefs: {},
    commonPrefs: {},
    inputIdHelpBundleKeyMap: {
        "enable": "help_enable",
        "embeded-enable": "help_embeded_enable",
        "hidePopup": "help_hide_popup",
        "autoPlayOnBuffer": "help_auto_play_on_buffer",
        "autoPlayOnSmartBuffer": "help_auto_play_on_smart_buffer",
        "onlyNotification": "help_only_notification",
        "onlyNotification-disabled": "help_only_notification_disabled",
        "desktopNotification": "help_desktop_notification",
        "desktopNotification-disabled": "help_desktop_notification_disabled",
        "soundNotification-disabled": "help_sound_notification_disabled",
        "saveBandwidth": "help_save_bandwidth",
        "turnOffPagedBuffering": "help_turn_off_paged_buffering"
    },
    init: function() {
        var me = this;
        common.init(function(prefs) {
            me.makkaPrefs = prefs.makka;
            me.embededPrefs = prefs.embeded;
            me.playlistOverridesPrefs = prefs.playlistOverrides;
            me.commonPrefs = prefs.common;
            me.localize();
            me.loadUI();
        });
    },
    findHelpTextForInput: function(input) {
        var bundleKey = input.getAttribute("helpText");
        if (bundleKey) {
            return this.getString(bundleKey);
        }
        var id = input.id;
        var idBundleKeyMap = this.inputIdHelpBundleKeyMap;
        bundleKey = input.disabled ? idBundleKeyMap[id + "-disabled"] || idBundleKeyMap[id.replace("embeded-", "") + "-disabled"] : null;
        if (!bundleKey) {
            bundleKey = idBundleKeyMap[id] || idBundleKeyMap[id.replace("embeded-", "")];
        }
        if (!bundleKey) {
            return null;
        }
        return this.getString(bundleKey);
    },
    insertHelpIcon: function(insertAfter, helpText, iconType) {
        var helpImg = document.createElement("img");
        helpImg.src = this.getURL("icons/" + iconType + ".png");
        helpImg.className = "help-img";
        NJS.Tooltip.bind(helpImg, helpText);
        var next = insertAfter.nextSibling;
        if (next) {
            insertAfter.parentNode.insertBefore(helpImg, next);
        } else {
            insertAfter.parentNode.appendChild(helpImg);
        }
    },
    setHelpIconForInput: function(input) {
        var helpText = this.findHelpTextForInput(input);
        if (!helpText) {
            return;
        }
        var iconType = input.disabled ? "exclamation": "help";
        input.title = helpText;
        var parentNode = this.findLabelFor(input) || input;
        this.insertHelpIcon(parentNode, helpText, iconType);
    },
    processHelpIconNodes: function() {
        var helpIconNodes = document.getElementsByTagName("helpIcon");
        for (var i = 0; i < helpIconNodes.length; i++) {
            var helpIconNode = helpIconNodes[i];
            var helpText = this.getString(helpIconNode.getAttribute("text"));
            this.insertHelpIcon(helpIconNode, helpText, helpIconNode.getAttribute("iconType"));
        }
    },
    setHelpIcons: function() {
        this.processHelpIconNodes();
        var f = function(tagName) {
            var inputs = document.getElementsByTagName(tagName);
            for (var i = 0; i < inputs.length; i++) {
                this.setHelpIconForInput(inputs[i]);
            }
        };
        f.call(this, "input");
        f.call(this, "select");
    },
    savePrefs: function() {
        common.savePrefs({
            makka: this.makkaPrefs,
            embeded: this.embededPrefs,
            common: this.commonPrefs,
            playlistOverrides: this.playlistOverridesPrefs
        });
    },
    getPrefs: function(embeded) {
        if (embeded) {
            return embededPrefs;
        } else {
            return prefs;
        }
    },
    generateId: function() {
        this._id = this._id || 0;
        return "generated" + this._id++;
    },
    getId: function(id, type) {
        if (type == "EMBEDED") {
            return "embeded-" + id;
        } else if (type == "PLAYLIST-OVERRIDES") {
            return "playlist-overrides-" + id;
        } else {
            return id;
        }
    },
    setMask: function(div) {
        if (!div) {
            return;
        }
        var maskDiv;
        var maskId = div.getAttribute("maskId");
        if (!maskId) {
            maskId = this.generateId();
            maskDiv = document.createElement("div");
            maskDiv.setAttribute("id", maskId);
            maskDiv.className = "mask-div";
            div.appendChild(maskDiv);
            div.setAttribute("maskId", maskId);
        } else {
            maskDiv = document.getElementById(maskId);
        }
        maskDiv.style.visibility = "visible";
        maskDiv.style.display = "block";
        var b = NJS.Layout.boxAttributes(div);
        maskDiv.style.top = b.top + "px";
        maskDiv.style.left = b.left + "px";
        maskDiv.style.height = b.height + "px";
        maskDiv.style.width = b.width + "px";
    },
    hideMask: function(div) {
        if (!div) {
            return;
        }
        var maskId = div.getAttribute("maskId");
        if (!maskId) {
            return;
        }
        var maskDiv = document.getElementById(maskId);
        maskDiv.style.top = "-100px";
        maskDiv.style.left = "-100px";
        maskDiv.style.height = "0px";
        maskDiv.style.width = "0px";
    },
    setPlaylistOverridePrefs: function(prefs) {
        var me = this;
        var type = "PLAYLIST-OVERRIDES";
        var c = document.getElementById(this.getId("enableOverrides", type));
        c.checked = prefs.enableOverrides;
        var f = function(c) {
            return (function() {
                var checked = c.checked;
                prefs.enableOverrides = checked;
                me.enablePanel(type, checked);
                me.savePrefs();
                alert(me.getString("reload_tabs_for_setting_to_apply"));
            });
        } (c);
        c.addEventListener("click", f, true);
        
        var c = document.getElementById(this.getId("enable", type));
        c.checked = prefs.enable;
        var f = function(c) {
            return (function() {
                var checked = c.checked;
                prefs.enable = checked;
                me.enablePanel(type, checked, "prefs-container-enable");
                me.savePrefs();
                alert(me.getString("reload_tabs_for_setting_to_apply"));
            });
        } (c);
        c.addEventListener("click", f, true);

        c = document.getElementById(this.getId("autoPlay", type));
        c.checked = prefs.autoPlay;
        f = function(c) {
            return (function() {
                var checked = prefs.autoPlay = c.checked;
                if (checked) {
                    document.getElementById(me.getId("autoPlayOnBuffer", type)).checked = false;
                    prefs.autoPlayOnBuffer = false;
                    prefs.autoBuffer = false;
                    me.enableBufferedPlayPanel(type, prefs);
                }
                me.savePrefs();
            });
        } (c);
        c.addEventListener("click", f, true);

        c = document.getElementById(this.getId("autoPlayOnBuffer", type));
        c.checked = prefs.autoPlayOnBuffer;
        f = function(c) {
            return (function() {
                var checked = c.checked;
                prefs.autoPlayOnBuffer = checked;
                prefs.autoBuffer = checked;
                if (checked) {
                    document.getElementById(me.getId("autoPlay", type)).checked = false;
                    prefs.autoPlay = false;
                }
                me.enableBufferedPlayPanel(type, prefs);
                me.savePrefs();
            });
        } (c);
        c.addEventListener("click", f, true);

        c = document.getElementById(this.getId("autoPlayOnSmartBuffer", type));
        c.checked = prefs.autoPlayOnSmartBuffer;
        f = function(c) {
            return (function() {
                prefs.autoPlayOnSmartBuffer = c.checked;
                document.getElementById(me.getId("autoPlayOnBufferPercentage", type)).disabled = c.checked;
                me.savePrefs();
            });
        } (c);
        c.addEventListener("click", f, true);

        c = document.getElementById(this.getId("autoPlayOnBufferPercentage", type));
        c.value = prefs.autoPlayOnBufferPercentage;
        c.disabled = prefs.autoPlayOnSmartBuffer;
        f = function(c) {
            return (function() {
                var val = parseInt(c.value);
                if (isNaN(val) || val < 0 || val > 100) {
                    c.value = prefs.autoPlayOnBufferPercentage;
                    c.select();
                    c.focus();
                } else {
                    c.value = val;
                    if (val != prefs.autoPlayOnBufferPercentage) {
                        prefs.autoPlayOnBufferPercentage = val;
                        me.savePrefs();
                    }
                }
            });
        } (c);
        c.addEventListener("blur", f, true);
    },
    setCommonPrefs: function(prefs) {
        var me = this;
        var c, f;

        c = document.getElementById("desktopNotification");
        if (this.desktopNotificationSupported()) {
            c.checked = prefs.desktopNotification;
            f = function(c) {
                return (function() {
                    var val = c.checked;
                    prefs.desktopNotification = val;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);
        } else {
            c.disabled = true;
        }

        c = document.getElementById("soundNotification");
        if (this.soundNotificationSupported()) {
            c.checked = prefs.soundNotification;
            f = function(c) {
                return (function() {
                    var val = c.checked;
                    prefs.soundNotification = val;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);
        } else {
            c.disabled = true;
        }
    },
    enablePanel: function(type, enabled, containerId) {
        containerId = containerId || "prefs-container";
        var div = document.getElementById(this.getId(containerId, type));
        if (enabled) {
            this.hideMask(div);
        } else {
            this.setMask(div);
        }
    },
    enableBufferedPlayPanel: function(type, prefs) {
        var td1 = document.getElementById(this.getId("container-td-bufferedPlay-first", type));
        var td2 = document.getElementById(this.getId("container-td-bufferedPlay-second", type));
        if (prefs.autoPlayOnBuffer) {
            this.hideMask(td1);
            this.hideMask(td2);
        } else {
            this.setMask(td1);
            this.setMask(td2);
        }
    },
    loadUI: function() {
        NJS.Tooltip.configure({
            cls: "tooltip"
        });
        this.onLoadUIFor("MAKKA", this.makkaPrefs).call(this);
        this.onLoadUIFor("EMBEDED", this.embededPrefs).call(this);
        this.onLoadUIFor("COMMON", this.commonPrefs).call(this);
        this.onLoadUIFor("PLAYLIST-OVERRIDES", this.playlistOverridesPrefs).call(this);
        
        this.loadUIForDevMode(this.commonPrefs);
        
        document.getElementById("close").addEventListener("click", function() {
            common.closeWindow();
        }, false);
        
        document.getElementById("donateLink").setAttribute("href", this.getDonateUrl());
        
        this.setHelpIcons();
        this.applyMasks();
        window.addEventListener("resize", function(e) {
                MyTubePrefs.applyMasks();
            },
        false);
    },
    loadUIForDevMode: function(prefs) {
        var me = this;
        var c = document.getElementById("logLevel");
        for (var i = 0; i < c.options.length; i++) {
            var option = c.options[i];
            if (option.value == String(prefs.logLevel)) {
                c.selectedIndex = i;
                break;
            }
        }
        var f = function(c) {
            return (function() {
                var val = c.options[c.selectedIndex].value;
                if (val != prefs.logLevel) {
                    prefs.logLevel = parseInt(val);
                    me.savePrefs();
                }
            });
        } (c);
        c.addEventListener("change", f, true);
        
        var devModeDiv = document.getElementById("devMode");
        devModeDiv.style.display = "none";
        
        document.getElementById("forDevMode").addEventListener("dblclick", function(e) {
            if(!e.ctrlKey || !e.altKey) {
                return;
            }
            var currDisplay = devModeDiv.style.display;
            devModeDiv.style.display = (currDisplay == "none" || currDisplay == "") ? "block" : "none";
            MyTubePrefs.applyMasks();
        }, false);
    },
    onLoadUIFor: function(type, prefs) {
        return (function() {
            var me = this;
            if (type == "COMMON") {
                this.setCommonPrefs(prefs);
                return;
            }
            if (type == "PLAYLIST-OVERRIDES") {
                this.setPlaylistOverridePrefs(prefs);
                return;
            }
            var c = document.getElementById(this.getId("enable", type));
            c.checked = prefs.enable;
            var f = function(c) {
                return (function() {
                    var checked = c.checked;
                    prefs.enable = checked;
                    me.enablePanel(type, checked);
                    me.savePrefs();
                    alert(me.getString("reload_tabs_for_setting_to_apply"));
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("loop", type));
            c.checked = prefs.loop;
            f = function(c) {
                return (function() {
                    prefs.loop = c.checked;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("hidePopup", type));
            c.checked = prefs.hidePopup;
            f = function(c) {
                return (function() {
                    prefs.hidePopup = c.checked;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("autoPlay", type));
            c.checked = prefs.autoPlay;
            f = function(c) {
                return (function() {
                    prefs.autoPlay = c.checked;
                    if (c.checked) {
                        document.getElementById(me.getId("autoBuffer", type)).checked = false;
                        prefs.autoBuffer = false;
                        document.getElementById(me.getId("autoPlayOnBuffer", type)).checked = false;
                        prefs.autoPlayOnBuffer = false;
                        me.enableBufferedPlayPanel(type, prefs);
                    }
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("autoBuffer", type));
            c.checked = prefs.autoBuffer;
            f = function(c) {
                return (function() {
                    prefs.autoBuffer = c.checked;
                    if (c.checked) {
                        document.getElementById(me.getId("autoPlay", type)).checked = false;
                        prefs.autoPlay = false;
                    } else {
                        document.getElementById(me.getId("autoPlayOnBuffer", type)).checked = false;
                        prefs.autoPlayOnBuffer = false;
                        me.enableBufferedPlayPanel(type, prefs);
                    }
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("autoPlayOnBuffer", type));
            c.checked = prefs.autoPlayOnBuffer;
            f = function(c) {
                return (function() {
                    prefs.autoPlayOnBuffer = c.checked;
                    if (c.checked) {
                        document.getElementById(me.getId("autoPlay", type)).checked = false;
                        prefs.autoPlay = false;
                        document.getElementById(me.getId("autoBuffer", type)).checked = true;
                        prefs.autoBuffer = true;
                        document.getElementById(me.getId("turnOffPagedBuffering", type)).checked = true;
                        prefs.turnOffPagedBuffering = true;
                    }
                    me.enableBufferedPlayPanel(type, prefs);
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("autoPlayOnSmartBuffer", type));
            c.checked = prefs.autoPlayOnSmartBuffer;
            f = function(c) {
                return (function() {
                    prefs.autoPlayOnSmartBuffer = c.checked;
                    document.getElementById(me.getId("autoPlayOnBufferPercentage", type)).disabled = c.checked;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("autoPlayOnBufferPercentage", type));
            c.value = prefs.autoPlayOnBufferPercentage;
            c.disabled = prefs.autoPlayOnSmartBuffer;
            f = function(c) {
                return (function() {
                    var val = parseInt(c.value);
                    if (isNaN(val) || val < 0 || val > 100) {
                        c.value = prefs.autoPlayOnBufferPercentage;
                        c.select();
                        c.focus();
                    } else {
                        c.value = val;
                        if (val != prefs.autoPlayOnBufferPercentage) {
                            prefs.autoPlayOnBufferPercentage = val;
                            me.savePrefs();
                        }
                    }
                });
            } (c);
            c.addEventListener("blur", f, true);
            
            c = document.getElementById(this.getId("turnOffPagedBuffering", type));
            c.checked = prefs.turnOffPagedBuffering;
            f = function(c) {
                return (function() {
                    /*var val = c.checked;
                    if(val) {
                        var q = document.getElementById(me.getId("quality", type));
                        if(q.options[q.selectedIndex].value == "default") {
                            alert(me.getString("need_to_select_one_quality_for_this"));
                        }
                    }*/
                    prefs.turnOffPagedBuffering = c.checked;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);
            

            c = document.getElementById(this.getId("quality", type));
            for (var i = 0; i < c.options.length; i++) {
                var option = c.options[i];
                if (option.value == prefs.quality) {
                    c.selectedIndex = i;
                    break;
                }
            }
            f = function(c) {
                return (function() {
                    var val = c.options[c.selectedIndex].value;
                    if (val != prefs.quality) {
                        prefs.quality = val;
                        me.savePrefs();
                    }
                });
            } (c);
            c.addEventListener("change", f, true);

            c = document.getElementById(this.getId("fshd", type));
            c.checked = !prefs.fshd;
            f = function(c) {
                return (function() {
                    prefs.fshd = !c.checked;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);
            
            c = document.getElementById(this.getId("hideAnnotations", type));
            c.checked = prefs.hideAnnotations;
            f = function(c) {
                return (function() {
                    prefs.hideAnnotations = c.checked;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            c = document.getElementById(this.getId("onlyNotification", type));
            if (this.anyNotificationSupported()) {
                c.checked = prefs.onlyNotification;
                f = function(c) {
                    return (function() {
                        prefs.onlyNotification = c.checked;
                        me.savePrefs();
                    });
                } (c);
                c.addEventListener("click", f, true);
            } else {
                c.disabled = true;
            }

            if (type == "EMBEDED") {
                c = document.getElementById(this.getId("enableFullScreen", type));
                c.checked = prefs.enableFullScreen;
                f = function(c) {
                    return (function() {
                        prefs.enableFullScreen = c.checked;
                        me.savePrefs();
                    });
                } (c);
                c.addEventListener("click", f, true);
            }

            c = document.getElementById(this.getId("saveBandwidth", type));
            c.checked = prefs.saveBandwidth;
            f = function(c) {
                return (function() {
                    var val = prefs.saveBandwidth = c.checked;
                    me.savePrefs();
                });
            } (c);
            c.addEventListener("click", f, true);

            if (type == "MAKKA") {
                c = document.getElementById(this.getId("playerSize", type));
                for (var i = 0; i < c.options.length; i++) {
                    var option = c.options[i];
                    if (option.value == prefs.playerSize) {
                        c.selectedIndex = i;
                        break;
                    }
                }
                f = function(c) {
                    return (function() {
                        var val = c.options[c.selectedIndex].value;
                        if (val != prefs.playerSize) {
                            prefs.playerSize = val;
                            me.savePrefs();
                        }
                    });
                } (c);
                c.addEventListener("change", f, true);

                c = document.getElementById(this.getId("enablePageAction", type));
                if(c) {
                    c.checked = prefs.enablePageAction;
                    f = function(c) {
                        return (function() {
                            var val = prefs.enablePageAction = c.checked;
                            me.savePrefs();
                        });
                    } (c);
                    c.addEventListener("click", f, true);
                }
            }
        });
    },
    anyNotificationSupported: function() {
        return this.soundNotificationSupported() || this.desktopNotificationSupported();
    },
    soundNotificationSupported: function() {
        if (this._soundSupported != null) {
            return this._soundSupported;
        }
        this._soundSupported = !!document.createElement("audio").play;
        return this._soundSupported;
    },
    desktopNotificationSupported: function() {
        return !!window.webkitNotifications;
    },
    applyMasks: function() {
        this.enablePanel("EMBEDED", this.embededPrefs.enable);
        this.enablePanel("MAKKA", this.makkaPrefs.enable);
        this.enablePanel("PLAYLIST-OVERRIDES", this.playlistOverridesPrefs.enableOverrides);
        this.enablePanel("PLAYLIST-OVERRIDES", this.playlistOverridesPrefs.enable, "prefs-container-enable");
        this.enableBufferedPlayPanel("EMBEDED", this.embededPrefs);
        this.enableBufferedPlayPanel("MAKKA", this.makkaPrefs);
        this.enableBufferedPlayPanel("PLAYLIST-OVERRIDES", this.playlistOverridesPrefs);
    },
    localize: function() {
        window.title = "SmartVideo For YouTube " + this.getString("preferences");
        document.getElementById("close").value = this.getString("close") + " [" + this.getString("esc") + "]";
        var f = function(tagName) {
            var els = document.getElementsByTagName(tagName);
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                var attributeName = tagName == "bundle" ? "key": "bundleKey";
                var key = el.getAttribute(attributeName);
                if (!key) {
                    continue;
                }
                var localized = this.getString(key);
                if (tagName == "bundle") {
                    var textNode = document.createTextNode(localized);
                    var par = el.parentNode;
                    par.insertBefore(textNode, el);
                    par.removeChild(el);
                    i--;
                } else if (tagName == "optgroup") {
                    el.setAttribute("label", localized);
                } else {
                    NJS.innerText(el, localized);
                }
            }
        };
        f.call(this, "bundle");
        f.call(this, "option");
        f.call(this, "optgroup");
    }
};
window.addEventListener("keyup",
function(e) {
    var key = e.keyCode;
    if (key == 27) {
        common.closeWindow();
    }
},
false);

if (window.document.readyState == "complete") {
  MyTubePrefs.init();
} else {
    document.addEventListener("DOMContentLoaded", function() {
        MyTubePrefs.init();
    }, false);
}
