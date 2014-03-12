
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
