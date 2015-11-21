(function() {
  $(window).load(function() {
    window.Client = new CClient({
      ClientManager: new CClientManager(),
      GameManager: new CGameManager(),
      InputController: new CInputController(),
      UI: new CUI(),
      GraphicEngine: new CGraphicEngine({
        canvas: $('#canvas')[0]
      }),
      IO: new CIO()
    });
    return $('#scaleRange').bind('input', function() {
      Client.GraphicEngine.camera.width = $('#scaleRange').val();
      return Client.GraphicEngine.camera.height = $('#scaleRange').val() / 2;
    });
  });

}).call(this);
