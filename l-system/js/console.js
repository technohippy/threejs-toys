document.addEventListener('DOMContentLoaded', function() {
  function $(id) {return document.getElementById(id)}

  if (!PARAMS.repeat) PARAMS.repeat = 3;

  var consoleElm = $('console');
  var button = $('console-button');
  button.addEventListener('click', function(evt) {
    if (consoleElm.classList.contains('hide')) {
      consoleElm.classList.remove('hide');
      consoleElm.classList.add('show');
    }
    else if (consoleElm.classList.contains('show')) {
      consoleElm.classList.remove('show');
      consoleElm.classList.add('hide');
    }
  });

  var stateElm = $('initial-state');
  stateElm.value = PARAMS['init'];
  var debugElm = $('debug');
  debugElm.checked = DEBUG;
  var repeat1Elm = $('repeat1');
  repeat1Elm.value = PARAMS['repeat1'] || PARAMS['repeat'];
  var repeat2Elm = $('repeat2');
  repeat2Elm.value = PARAMS['repeat2'] || 1;
  var rules1Elm = $('rules1');
  var rules2Elm = $('rules2');
  for (var key in PARAMS) {
    if (!PARAMS.hasOwnProperty(key)) continue;
    var val = PARAMS[key];
    if (key.match(/^rule1-/)) {
      rules1Elm.value += key.substring('rule1-'.length) + '=' + val + '\n';
    }
    else if (key.match(/^rule2-/)) {
      rules2Elm.value += key.substring('rule2-'.length) + '=' + val + '\n';
    }
  }

  $('reload').addEventListener('click', function() {
    var params = ['step=2'];
    console.log(debugElm.value);
    params.push('debug=' + (debugElm.checked ? 1 : 0));
    params.push('init=' + stateElm.value);
    params.push('repeat1=' + repeat1Elm.value);
    params.push('repeat2=' + repeat2Elm.value);
    var rules1 = rules1Elm.value.split('\n');
    for (var i1 = 0; i1 < rules1.length; i1++) {
      var rule1 = rules1[i1];
      if (rule1) {
        var kv1 = rule1.split('=');
        params.push('rule1-' + kv1[0] + '=' + encodeURIComponent(kv1[1]));
      }
    }
    var rules2 = rules2Elm.value.split('\n');
    for (var i2 = 0; i2 < rules2.length; i2++) {
      var rule2 = rules2[i2];
      if (rule2) {
        var kv2 = rule2.split('=');
        params.push('rule2-' + kv2[0] + '=' + kv2[1]);
      }
    }
    window.location = '?' + params.join('&');
  });
});
