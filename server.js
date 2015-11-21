(function() {
  var CClientManager, CGameManager, CIO, CModel, CServer, CWebServer, Server;

  CServer = require('./server/CServer');

  CWebServer = require('./server/CWebServer');

  CClientManager = require('./server/CClientManager');

  CModel = require('./server/CModel');

  CGameManager = require('./server/CGameManager');

  CIO = require('./server/CIO');

  Server = new CServer({
    WebServer: new CWebServer({
      port: Number(process.env.PORT || 3000)
    }),
    ClientManager: new CClientManager(),
    GameManager: new CGameManager(),
    Model: new CModel(),
    IO: new CIO({
      port: Number(process.env.PORT || 5000)
    })
  });

}).call(this);
