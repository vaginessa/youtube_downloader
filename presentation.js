(function() {
  "use strict";

  var
    container = document.createElement('div')
    , placement = document.querySelector('#watch7-content');
//    , get_button = function(text) {
//      return '<button class=\"yt-uix-button yt-uix-button-size-default yt-uix-button-default inq-no-click\" type=\"button\"><span class=\"yt-uix-button-content\">###TEXT###</span></button>' //onclick=\";return false;\" id=\"a1\"
//        .replace('###TEXT###', text);
//    }
//    ;

  container.style.cssText = 'padding:10px 10px 10px 10px; height:100px; background:url(\'data:image/png;base64,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\')';
  //container.innerHTML = get_button('⇩ some text');

  placement.insertBefore(container, placement.firstElementChild);
}());

//part 2 is fetching the data
(function() {
  "use strict";

  var videos, parameters,
      item,
      name, value;


//  videos = eval("ytplayer.config.args.adaptive_fmts").split(',');
  videos = eval("ytplayer.config.args.url_encoded_fmt_stream_map").split(',');

  videos = Array.prototype.map.call(videos, function(video) {
    parameters = video.split('&');

    item = {};

    //generic
    parameters.forEach(function(parameter) {
      parameter = decodeURIComponent(parameter.replace('=', '|||')).split('|||'); //= may be a legitimate value, so before decrypt, we switch it so something "rare" (||| will do just fine..).

      name = parameter[0];
      value = parameter[1];

      //specific
      if (-1 !== name.indexOf('fallback')) {
        return;
      }

      item[name] = value;
    });

    //specific
    item['mimetype'] = item.type.split(';')[0];
    item['ext'] = item['mimetype'].split('/')[1];

    return item;
  });


  console.log(videos);


}());


var formats = (function() {
  "use strict";

  var formats, items = {};

  formats = eval("ytplayer.config.args.fmt_list").split(',');

  formats.forEach(function(element) {
    element = element.split('/');

    items[element[0]] = element[1];
  });

  return items;
}());