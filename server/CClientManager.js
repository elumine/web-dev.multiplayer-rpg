(function() {
  var CClientManager, CClientObject;

  CClientObject = require('./CClientObject');

  CClientManager = (function() {
    function CClientManager(options) {
      this.ClientArray = [];
    }

    CClientManager.prototype.setClientArray = function() {
      var ClientFileName, temp, _i, _len, _results;
      temp = this.Server.Model.getClientList();
      _results = [];
      for (_i = 0, _len = temp.length; _i < _len; _i++) {
        ClientFileName = temp[_i];
        this.ClientArray[ClientFileName] = this.Server.Model.getClient(ClientFileName);
        this.ClientArray[ClientFileName].status = 'offlane';
        if (this.ClientArray[ClientFileName].ClientSocketID) {
          delete this.ClientArray[ClientFileName].ClientSocketID;
        }
        if (this.ClientArray[ClientFileName].GameID) {
          delete this.ClientArray[ClientFileName].GameID;
        }
        _results.push(this.updateModel(this.ClientArray[ClientFileName]));
      }
      return _results;
    };

    CClientManager.prototype.getClientObjectBySocketID = function(ClientSocketID) {
      var key, value, _ref;
      _ref = this.ClientArray;
      for (key in _ref) {
        value = _ref[key];
        if (value.ClientSocketID === ClientSocketID) {
          return value;
        }
      }
    };

    CClientManager.prototype.updateModel = function(ClientObject) {
      return this.Server.Model.setClient(ClientObject);
    };

    CClientManager.prototype.setRegistration = function(ClientSocketID, message) {
      if (!this.ClientArray[message.id]) {
        this.ClientArray[message.id] = new CClientObject({
          id: message.id,
          password: message.password
        });
        this.updateModel(this.ClientArray[message.id]);
        return this.Server.IO.send(ClientSocketID, {
          header: 'setRegistration',
          result: true,
          ClientObject: this.ClientArray[message.id]
        });
      } else {
        return this.Server.IO.send(ClientSocketID, {
          header: 'setRegistration',
          result: false,
          error: 'Client Exists'
        });
      }
    };

    CClientManager.prototype.setOnline = function(ClientSocketID, message) {
      if (this.ClientArray[message.id]) {
        if (this.ClientArray[message.id].password === message.password) {
          this.ClientArray[message.id].status = 'online';
          this.ClientArray[message.id].ClientSocketID = ClientSocketID;
          this.updateModel(this.ClientArray[message.id]);
          return this.Server.IO.send(ClientSocketID, {
            header: 'setOnline',
            result: true,
            ClientObject: this.ClientArray[message.id]
          });
        } else {
          return this.Server.IO.send(ClientSocketID, {
            header: 'setOnline',
            result: false,
            error: 'Password not match'
          });
        }
      } else {
        return this.Server.IO.send(ClientSocketID, {
          header: 'setOnline',
          result: false,
          error: 'Client ' + message.id + ' is undefined'
        });
      }
    };

    CClientManager.prototype.setOffline = function(ClientSocketID) {
      var ClientObject,
        _this = this;
      ClientObject = this.getClientObjectBySocketID(ClientSocketID);
      if (ClientObject.status === 'loadGame' || ClientObject.status === 'readyGame' || ClientObject.status === 'startGame') {
        this.Server.ClientManager.setLeaveGame(ClientSocketID, {
          ClientObject: ClientObject
        });
        return setTimeout(function() {
          _this.ClientArray[ClientObject.id].status = 'offlane';
          delete _this.ClientArray[ClientObject.id].ClientSocketID;
          _this.updateModel(_this.ClientArray[ClientObject.id]);
          return _this.Server.IO.send(ClientSocketID, {
            header: 'setOffline',
            result: true
          });
        }, 100);
      } else {
        this.ClientArray[ClientObject.id].status = 'offlane';
        delete this.ClientArray[ClientObject.id].ClientSocketID;
        this.updateModel(this.ClientArray[ClientObject.id]);
        return this.Server.IO.send(ClientSocketID, {
          header: 'setOffline',
          result: true
        });
      }
    };

    CClientManager.prototype.setJoinGame = function(ClientSocketID, message) {
      var ClientObject, Game, i, _i, _len, _ref, _results;
      ClientObject = this.getClientObjectBySocketID(ClientSocketID);
      if (this.Server.GameManager.GameArray.length === 0) {
        this.Server.GameManager.setGame();
        return this.setJoinGame(ClientSocketID, message);
      } else {
        _ref = this.Server.GameManager.GameArray;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          Game = _ref[i];
          if (Game.status === 'empty') {
            this.Server.GameManager.GameArray[Game.id].addCharacter(ClientObject.id, message.modelID);
            this.ClientArray[ClientObject.id].status = 'joinGame';
            this.ClientArray[ClientObject.id].GameID = Game.id;
            this.updateModel(this.ClientArray[ClientObject.id]);
            _results.push(this.Server.IO.send(ClientSocketID, {
              header: 'setJoinGame',
              result: true,
              GameObject: {
                id: Game.id
              },
              ClientObject: this.ClientArray[ClientObject.id]
            }));
          } else {
            if (i === this.Server.GameManager.GameArray.length - 1) {
              this.Server.GameManager.setGame();
              _results.push(this.setJoinGame(ClientSocketID, message));
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      }
    };

    CClientManager.prototype.setLoadGame = function(ClientSocketID) {
      var ClientObject;
      ClientObject = this.getClientObjectBySocketID(ClientSocketID);
      this.ClientArray[ClientObject.id].status = 'loadGame';
      this.updateModel(this.ClientArray[ClientObject.id]);
      return this.Server.IO.send(ClientSocketID, {
        header: 'setLoadGame',
        result: true,
        ClientObject: this.ClientArray[ClientObject.id]
      });
    };

    CClientManager.prototype.setReadyGame = function(ClientSocketID) {
      var ClientObject;
      ClientObject = this.getClientObjectBySocketID(ClientSocketID);
      this.ClientArray[ClientObject.id].status = 'readyGame';
      this.updateModel(this.ClientArray[ClientObject.id]);
      return this.Server.IO.send(ClientSocketID, {
        header: 'setReadyGame',
        result: true,
        ClientObject: this.ClientArray[ClientObject.id]
      });
    };

    CClientManager.prototype.setLeaveGame = function(ClientSocketID) {
      var ClientObject;
      ClientObject = this.getClientObjectBySocketID(ClientSocketID);
      if (this.Server.GameManager.GameArray[this.ClientArray[ClientObject.id].GameID]) {
        this.Server.GameManager.GameArray[this.ClientArray[ClientObject.id].GameID].clientLeaveGame(ClientObject);
      }
      delete this.ClientArray[ClientObject.id].GameID;
      this.ClientArray[ClientObject.id].status = 'online';
      this.updateModel(this.ClientArray[ClientObject.id]);
      return this.Server.IO.send(ClientSocketID, {
        header: 'setLeaveGame',
        result: true,
        ClientObject: this.ClientArray[ClientObject.id]
      });
    };

    return CClientManager;

  })();

  module.exports = CClientManager;

}).call(this);
