(function(global) {
    var Upgrade = function() {
        var safeFunction =  function(fn, scope) {
            return (function() {
                try {
                    fn.apply(scope || this, arguments);
                } catch (ex) {}
            });
        };

        var runUpgrades = function(updates, mbrowser) {
            var currentVersion = updates.currentVersion;
            var prefs = mbrowser.extension.prefs;
            
            var lastVersion = prefs.getVersion();
            
            if(lastVersion == -1) {
                mbrowser.extension.showWelcomePage();
            }
            
            if (currentVersion == lastVersion) {
                return;
            }
            
            prefs.setVersion(currentVersion);
            
            if (lastVersion == -1) {
                return;
            }
            var updateList = updates.list;
            for(var i = 0, len = updateList.length; i < len; i++) {
                var update = updateList[i];
                if(lastVersion < update.version) {
                    safeFunction(update.run)(prefs);
                }
            }
        };
        
        return ({
            upgrade: function(updates, mbrowser) {
                runUpgrades(updates, mbrowser);
            }
        });
    } ();
    
    global.Upgrade = Upgrade;
})(exports);