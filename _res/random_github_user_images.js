document.querySelector('body').innerHTML = "";
document.querySelector('body').innerHTML =
(function (n) {
  "use strict";

  var html = "";

  /* styles */
  html += (function () {
    var template = '#img##ID##{background-image:url(\'https://avatars.githubusercontent.com/u/##RANDOM##?v=3\')}';

    template = (new Array(n)).join(',').split(',').map(function (item, index) {
      return template
        .replace('##ID##', String(index))
        .replace('##RANDOM##', String(Math.floor(2000 + Math.random() * 4000)))
        ;
    }).join("\n");

    return "<style>\ndiv[id^=img]{display:inline-block;width:100px; height:100px; background-color:rgba(170,204,247,.7); background-repeat:no-repeat; background-position:center center; background-attachment:local; background-size:contain; padding:0; margin:0;}\n" + template + "\n</style>";
  }());

  /* containers */
  html += (function () {
    var template = '<div id=\'img##ID##\'></div>';

    template = (new Array(n)).join(',').split(',').map(function (item, index) {
      return template.replace('##ID##', String(index));
    }).join("\n");

    return '<div id="container-imgs">' + "\n" + template + "\n" + '</div>';
  }());

  return html;
}(10));
