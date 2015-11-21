(function() {
  var CGameManager, CGameObject;

  CGameObject = require('./CGameObject');

  CGameManager = (function() {
    function CGameManager(options) {
      this.GameArray = [];
    }

    CGameManager.prototype.setGame = function() {
      return this.GameArray.push(new CGameObject({
        id: this.GameArray.length,
        GameManager: this
      }));
    };

    CGameManager.prototype.removeGame = function(GameObject) {
      return this.GameArray[GameObject.id] = false;
    };

    CGameManager.prototype.inputController = function(ClientSocketID, message) {
      var ClientObject;
      ClientObject = this.Server.ClientManager.getClientObjectBySocketID(ClientSocketID);
      if (this.GameArray[ClientObject.GameID]) {
        if (this.GameArray[ClientObject.GameID].status === 'start') {
          return this.GameArray[ClientObject.GameID].clientEventHandler(ClientObject, message.event);
        }
      }
    };

    return CGameManager;

  })();

  module.exports = CGameManager;

}).call(this);
