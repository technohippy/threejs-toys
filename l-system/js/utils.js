var Utils = {
  getParams: function() {
    var params = {};
    if (window.location.search) {
      var pairs = window.location.search.substring(1).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        params[pair[0]] = pair[1];
      }
    }
    return params;
  }
};
