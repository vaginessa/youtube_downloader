var port = exports.port;
var updates = exports.updates;
var tabBundleKeys = exports.tabBundleKeys;

var MyTube = exports.MyTube;
var Upgrade = exports.Upgrade;

port.init();

Upgrade.upgrade(updates, port.mbrowser);
MyTube.init(port.chrome, port.mbrowser, tabBundleKeys);
