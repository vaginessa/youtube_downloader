(function() {
  "use strict";


  var split_2d, split_3d,
      video_formats, video_resources,
      evnt;


  /**
   * evnt
   * @param {string}     type                   - event name, without the "on" prefix.
   * @param {Element=}   obj                    - optional. element to assign event onto, if not valid, and a function (next parameter) exist, the function will run in the scope.
   * @param {Function=}  func                   - optional. a callback to be executed when the event triggered. the func should be accepting one parameter, which is the event, or non if you do not need the event.
   * @param {*=}         scopeToExecuteFuncIn   - optional. a scope, that can be an object or DOM-Node (usually "document" or "this" from where ever you are working). if no scope has called, the default is "document". you might want to pass this parameter anyway, use the "this" phrase to make the execution of the callback near your scope.
   * @param {boolean=}   isUseNativeOnEvents    - use only legacy "On***" events, instead of available new event listeners.
   */
  evnt = function(type, obj, func, scopeToExecuteFuncIn, isUseNativeOnEvents) {
    var /* @type {?*=} */ oldEvent, /* @type {string} */ onType, /* @type {boolean} */isUseIEFixForOnload, /* @type {Function} */ genericOnEventHandler, /* @type {Function} */ simulateOnLoadEventHandler, /* @type {Function} */ eventHandler, /* @type {Function} */ keepOldOverride;

    scopeToExecuteFuncIn = scopeToExecuteFuncIn || document;

    if (!obj) {
      if (scopeToExecuteFuncIn) {
        func.call(scopeToExecuteFuncIn, null);
      }
      else {
        func();
      }
      return;
    }

    //------------------------------------------------------------------------ event handler, one of those will be chosen.
    genericOnEventHandler = function(event) {
      if (scopeToExecuteFuncIn) {
        func.call(scopeToExecuteFuncIn, event);
      }
      else {
        func(event);
      }
    };

    simulateOnLoadEventHandler = function(event) {
      var readyState = obj['readyState'];

      if (readyState && (readyState === 'complete')) { //equal to "onload" in IE:  onReadyStateChanged + readyState==='complete'
        if (scopeToExecuteFuncIn) {
          func.call(scopeToExecuteFuncIn, event);
        }
        else {
          func(event);
        }
      }
    };
    //---------------------------------------------------------------------------------------


    eventHandler = genericOnEventHandler; //reference to function.

    type = type.toLowerCase();

    isUseIEFixForOnload = (!obj.addEventListener) && (type === "load") && (obj['readyState']);  //switch from using "load" to using "readyStateChange" events, the event will simulate "load" by waiting for obj.readyState='complete'. this only happens if the original event type was asked to be "load". so it is a fix.
    if (isUseIEFixForOnload) {
      type = "ReadyStateChange";
      eventHandler = simulateOnLoadEventHandler; //override with diffrent reference to function. the other function- the one used for event handler "onload fix in IE, by using readyState=complete".
    }

    onType = "on" + type;


    if ((!isUseNativeOnEvents) && obj.addEventListener) {
      obj.addEventListener(type, eventHandler, false);
    }
    else if ((!isUseNativeOnEvents) && obj.attachEvent) {
      obj.attachEvent(onType, eventHandler);
    }
    else {
      oldEvent = obj[onType];

      keepOldOverride = function(event) {   //simulate queue of events, do no override old event. execute newest event handler, in our scope, with the 'event' element. then execute the old event handler, again with the same 'event' handler.
        eventHandler.call(this, event);
        oldEvent.call(this, event);
      };

      obj[onType] = keepOldOverride;
    }

  };

  split_2d = function(text, splitters) { //['&', '='] or   [',', '/'] for "formats"
    splitters = ("undefined" !== typeof splitters) ? splitters : ['&', '='];

    var items = {};
    text.split(splitters[0]).forEach(function(element) {
      element = element.split(splitters[1]);
      element[0] = decodeURIComponent(element[0]);
      element[1] = decodeURIComponent(element[1]);

      items[element[0]] = element[1];
    });

    return items;
  };

  split_3d = function(text, splitters) { //[',','&','=']
    splitters = ("undefined" !== typeof splitters) ? splitters : [',', '&', '='];

    var splitters_2dimentions = [splitters[1], splitters[2]];

    return text.split(splitters[0]).map(function(item) {
      return split_2d(item, splitters_2dimentions);
    });
  };

  video_formats = split_2d(eval("ytplayer.config.args.fmt_list"), [',', '/']);

  video_resources = (function() {
    var video_resources = split_3d(eval("ytplayer.config.args.url_encoded_fmt_stream_map")); //initial data

    video_resources = video_resources.map(function(item) { //make initial data better
      item['mimetype'] = item.type.split(';')[0];

      item['ext'] = item['mimetype'].split('/')[1];
      item['ext'] = (-1 !== item['ext'].indexOf('flv')) ? 'flv' : item['ext'];  //turns "x-flv" to "flv" (webm and mp4 are ok already..)

      item['resolution'] = video_formats[item['itag']];
      item['points'] = item['resolution'].split('x')[1] + 'p';

      delete item['fallback_host'];  // not needed
      delete item['itag'];           // not needed

      return item;
    });

    video_resources.sort(function(a, b) { //order the array from smaller resolution to largest.
      return a.points < b.points ? -1 : a.points > b.points ? 1 : 0;
    });

    return video_resources;
  }());

  console.log(video_resources);
}());