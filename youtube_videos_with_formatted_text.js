sources = (function(sources, tmp){
  return sources.split(',').map(function(source){
    tmp = {};
    source.split('&').forEach(function(part){
      part = part.split('=');
      tmp[ part[0] ] = decodeURIComponent( part[1] );
    });
    return tmp;
  });
}(
  ytplayer.config.args.url_encoded_fmt_stream_map
, []
));
  
Object.prototype.keys   = function(){ return Object.keys(this); };
Object.prototype.values = function(){ var me = this;  return Object.keys(me).map(function(key){ return me[key] }); };
  
  sources = [""
, "<table>"
, "  <thead><td>" + sources[0].keys().join("</td><td>") + "</td></thead>"
, "  <tbody>"
,    sources.map(function(source){  "<tr><td>" + source.values().join("</td><td>") + "</td><tr>"   }).join("\n")
, "  </tbody>"
, "</table>"
].join("");


console.log(sources);