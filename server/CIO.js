(function() {
  var CIO, WebSocketServer;

  WebSocketServer = new require('ws');

  CIO = (function() {
    function CIO(options) {
      var _this = this;
      this.ClientArray = [];
      this.socketServer = new WebSocketServer.Server({
        port: 5000
      });
      console.log("IO.socketServer runnig at " + 5000);
      this.socketServer.on('connection', function(socket) {
        var ClientSocketID;
        ClientSocketID = _this.ClientArray.length;
        _this.ClientArray[ClientSocketID] = socket;
        console.log('Client connection', ClientSocketID);
        socket.on('message', function(message) {
          return _this.recive(ClientSocketID, JSON.parse(message));
        });
        return socket.on('close', function() {
          var ClientObject;
          ClientObject = _this.Server.ClientManager.getClientObjectBySocketID(ClientSocketID);
          console.log('Client disconnection', ClientSocketID);
          if (ClientObject) {
            return _this.Server.ClientManager.setOffline(ClientSocketID, {
              ClientObject: ClientObject
            });
          } else {
            return delete _this.ClientArray[ClientSocketID];
          }
        });
      });
    }

    CIO.prototype.send = function(ClientSocketID, message) {
      if (this.ClientArray[ClientSocketID].readyState === 1) {
        return this.ClientArray[ClientSocketID].send(JSON.stringify(message));
      }
    };

    CIO.prototype.recive = function(ClientSocketID, message) {
      switch (message.header) {
        case 'setRegistration':
          return this.Server.ClientManager.setRegistration(ClientSocketID, message);
        case 'setOnline':
          return this.Server.ClientManager.setOnline(ClientSocketID, message);
        case 'setOffline':
          return this.Server.ClientManager.setOffline(ClientSocketID, message);
        case 'setJoinGame':
          return this.Server.ClientManager.setJoinGame(ClientSocketID, message);
        case 'setLoadGame':
          return this.Server.ClientManager.setLoadGame(ClientSocketID, message);
        case 'setReadyGame':
          return this.Server.ClientManager.setReadyGame(ClientSocketID, message);
        case 'setStartGame':
          return this.Server.ClientManager.setStartGame(ClientSocketID, message);
        case 'setLeaveGame':
          return this.Server.ClientManager.setLeaveGame(ClientSocketID, message);
        case 'InputController':
          return this.Server.GameManager.inputController(ClientSocketID, message);
      }
    };

    return CIO;

  })();

  module.exports = CIO;

}).call(this);
