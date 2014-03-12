/* Riot 0.9.8, @license MIT, (c) 2014 Moot Inc + contributors */
(function($) { "use strict";

$.observable = function(el) {
  var callbacks = {}, slice = [].slice;

  el.on = function(events, fn) {
    if (typeof fn === "function") {
      events.replace(/[^\s]+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn);
        fn.typed = pos > 0;
      });
    }
    return el;
  };

  el.off = function(events) {
    events.replace(/[^\s]+/g, function(name) {
      callbacks[name] = [];
    });
    if (events == "*") callbacks = {};
    return el;
  };

  // only single event supported
  el.one = function(name, fn) {
    if (fn) fn.one = true;
    return el.on(name, fn);
  };

  el.trigger = function(name) {
    var args = slice.call(arguments, 1),
      fns = callbacks[name] || [];

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!((fn.one && fn.done) || fn.busy)) {
        fn.busy = true;
        fn.apply(el, fn.typed ? [name].concat(args) : args);
        fn.done = true;
        fn.busy = false;
      }
    }

    return el;
  };

  return el;

};

// Precompiled templates (JavaScript functions)
var FN = {};

var ESCAPING_MAP = {
  "\\": "\\\\",
  "\n": "\\n",
  "\r": "\\r",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
  "'": "\\'"
};

var ENTITIES_MAP = {
  '&': '&amp;',
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;'
};

// Render a template with data
$.render = function(template, data) {
  if(!template) return '';

  FN[template] = FN[template] || new Function("_", "E",
    "return '" + template
      .replace(
        /[\\\n\r\u2028\u2029']/g,
        function(escape) { return ESCAPING_MAP[escape]; }
      ).replace(
        /\{\s*([\.\w]+)\s*\}/g,
        "'+(function(){try{return(_.$1?(_.$1+'').replace(/[&\"<>]/g,function(e){return E[e];}):(_.$1===0?0:''))}catch(e){return ''}})()+'"
      )+"'"
  );

  return FN[template](data, ENTITIES_MAP);
};


/* Cross browser popstate */

// for browsers only
if (typeof top != "object") return;

var currentHash,
  pops = $.observable({}),
  doc = document;

function pop(hash) {
  if (typeof hash != "string")
    hash = window.location.hash;
  if (hash.charAt(0) == '#')
    hash = hash.substring(1);
  if (hash != currentHash)
    pops.trigger("pop", hash);
  currentHash = hash;
}

jQuery(window).bind('hashchange', pop);
jQuery(pop);

// Change the browser hash
$.route = function(to) {
  if (typeof to === "function")
    return pops.on("pop", to);

  to = to.substring(to.indexOf("#"), to.length);
  window.location.hash = to;

  if (!("onhashchange" in window)) {
    pop(to);
  }
};
})(typeof top == "object" ? window.$ || (window.$ = {}) : exports);
