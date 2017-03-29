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
sources = JSON.stringify(sources, null, 2).replace(/,\n /g, "\n ,").replace(/ *(,(\ +))/g,"$2,")
