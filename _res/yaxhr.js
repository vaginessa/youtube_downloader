//@formatter:off

/**
 * @typedef yaxhr
 * @type {Object}
 * @property {boolean=} [is_asynchronous=true]
 * @property {Object=}  [data={}]
 * @property {string=}  protocol
 * @property {string=}  [method="GET"]
 * @property {Object=}  [url="about:blank"]
 * @property {Object=}  callback
 * @property {Object=}  callback_error
 * @property {Object=}  callback_timeout
 * @property {string=}  [url_proxy="http://fetch.eladkarako.com?url="]
 * @property {string=}  [url_proxy_ssl="https://onepxy.appspot.com/fetch.eladkarako.com?url="]
 * @property {Object=}  url_target        - for the use of return object, rewritten.
 * @property {string=}  data_parsed       - for the use of return object, rewritten.
 * @property {Object=}  xhr               - for the use of return object, rewritten.
 */

/**
 *
 * @param   {yaxhr} config
 * @returns {yaxhr}
 */
function file_get_content(config){
  //normalize arguments
  config.is_asynchronous  = 'boolean'  === typeof config.is_asynchronous   ? config.is_asynchronous   : true                                                    ;
  config.data             = 'object'   === typeof config.data              ? config.data              : {}                                                      ;
  config.url              = 'string'   === typeof config.url               ? config.url               : 'about:blank'                                           ;
  config.callback         = 'function' === typeof config.callback          ? config.callback          : function(e){console.log(e.target)}                      ;
  config.callback_error   = 'function' === typeof config.callback_error    ? config.callback_error    : function(e){console.error(e.target)}                    ;
  config.callback_timeout = 'function' === typeof config.callback_timeout  ? config.callback_timeout  : function(e){console.error(e.target)}                    ;
  config.url_proxy        = 'string'   === typeof config.url_proxy         ? config.url_proxy         : 'http://fetch.eladkarako.com?url='                      ;
  config.url_proxy_ssl    = 'string'   === typeof config.url_proxy_ssl     ? config.url_proxy_ssl     : 'https://onepxy.appspot.com/fetch.eladkarako.com?url='  ;
  config.protocol         = (function(){
                              config.protocol = String(config.protocol).toLowerCase().replace(/:/g,'') + ':';
                              return (-1 === ['http:','https:'].indexOf(config.protocol)) ? window.location.protocol : config.protocol;
                            }());

  config.method           = (function(){
                              config.method = String(config.method).toUpperCase();
                              return (-1 === ['HEAD','GET','POST','OPTIONS','TRACE','CONNECT','PUT'].indexOf(config.method)) ? 'GET' : config.method;
                            }());

  //+
  config.url_target     = ('https:' === config.protocol ? config.url_proxy_ssl : config.url_proxy) + encodeURIComponent(config.url);
  config.data_parsed    = Object.keys(config.data).map(function(key){ return String(key) + '=' + encodeURIComponent(String(config.data[key]))}).join('&');

  config.xhr            = new XMLHttpRequest();

  //main
  config.xhr.responseType = "text";
  config.xhr.onreadystatechange = function(){
   (config.xhr.DONE !== config.xhr.readyState && 4 !== xhr.status % 10 && 5 !== xhr.status % 10) && 
            config.callback(config.xhr.responseText, config.xhr) || 
            config.callback_error(config.xhr);
  };
  config.xhr.onerror            = function(){ config.callback_error(config.xhr)   };
  config.xhr.ontimeout          = function(){ config.callback_timeout(config.xhr) };

  config.xhr.open(config.method, config.url_target, config.is_asynchronous);
  config.xhr.setRequestHeader('Content-Type', 'text/plain');
  config.xhr.send(config.data_parsed);

  return config;
}
