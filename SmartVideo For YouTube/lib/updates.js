(function(global) {
    var updates = {
        currentVersion: 0.9931,
        list: [{
                version: 0.7, //version should be same at which the upgrade was needed. This upgrade was release with 0.7 version. So it will run for < 0.7 versions.
                run: function(prefs) {
                    var name = "mytubequality";
                    var val = prefs.get(name);
                    if (val == "0") {
                        val = "default";
                        prefs.save(name, val);
                    } else if (val == "1") {
                        val = "hd720";
                        prefs.save(name, val);
                    } else if (val == "2") {
                        val = "small";
                        prefs.save(name, val);
                    }
                    var keysToModify = ["mytubeloop", "hidepopup", "mytubeautoplay", "mytubeautobuffer", "mytubeautoplayonbuffer", "mytubeautoplayonbufferpercentage", "mytubeautoplayonsmartbuffer", "mytubequality"];
                    for (var i = 0; i < keysToModify.length; i++) {
                        var key = keysToModify[i];
                        var val = prefs.get(key);
                        if (val == null) {
                            continue;
                        }
                        prefs.remove(key);
                        var newKey = key.replace("mytube", "");
                        prefs.save("makka-" + newKey, val);
                        prefs.save("embeded-" + newKey, val);
                    }
                }
            }, {
                version: 0.93,
                run: function(prefs) {
                    var autoPlayOnBuffer = prefs.get("playlistOverrides-autoplayonbuffer");
                    if(autoPlayOnBuffer == null) {
                        return;
                    }
                    var autoBuffer = (autoPlayOnBuffer == "true") ? "true" : "false";
                    prefs.save("playlistOverrides-autobuffer", autoBuffer);
                }
            }, {
                version: 0.96,
                run: function(prefs) {
                    var autoPlayOnBuffer = prefs.get("playlistOverrides-autoplayonbuffer");
                    if(autoPlayOnBuffer == null) {
                        return;
                    }
                    var autoPlay = (autoPlayOnBuffer == "true") ? "false" : "true";
                    prefs.save("playlistOverrides-autoplay", autoPlay);
                }
            }, {
                version: 0.9922,
                run: function(prefs) {
                    prefs.rename("playlistOverrides-enable", "playlistOverrides-enableoverrides");
                    prefs.rename("makka-turnOffPagedBuffering", "makka-turnoffpagedbuffering");
                    prefs.rename("embeded-turnOffPagedBuffering", "embeded-turnoffpagedbuffering");
                    prefs.copy("makka-enable", "playlistOverrides-enable");
                }
            }, {
                version: 0.9925,
                run: function(prefs) {
                    var size = prefs.get("makka-playersize");
                    if(size && size != "small" && size != "default") {
                        prefs.save("makka-playersize", "large");
                    }
                }
            }
        ]
    };
    
    global.updates = updates;  
})(exports);