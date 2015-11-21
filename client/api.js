(function() {
  var require;

  require = function(url) {
    var script;
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'client/' + url + '.js';
    return document.getElementsByTagName('head')[0].appendChild(script);
  };

  require('CClient');

  require('CClientManager');

  require('CGameManager');

  require('CInputController');

  require('CGraphicEngine');

  require('CSprite');

  require('CUI');

  require('CIO');

  require('common');

  require('localization');

}).call(this);
