(function() {
  var CClientManager;

  CClientManager = (function() {
    function CClientManager(options) {
      this.ClientObject = false;
      this.modelID = 'modelA';
    }

    CClientManager.prototype.update = function(ClientObject) {
      return this.ClientObject = ClientObject;
    };

    CClientManager.prototype.authentification = function(data) {
      var temp;
      temp = true;
      if (!data.id || !data.password) {
        temp = false;
      }
      return temp;
    };

    CClientManager.prototype.setRegistration = function(data) {
      if (this.authentification(data)) {
        return this.Client.IO.send({
          header: 'setRegistration',
          id: data.id,
          password: data.password
        });
      } else {
        return this.Client.UI.showInfoWindow('registration', false);
      }
    };

    CClientManager.prototype.getRegistration = function(message) {
      var _this = this;
      if (message.result) {
        this.Client.UI.showInfoWindow('registration', true);
        return setTimeout(function() {
          return _this.Client.ClientManager.setOnline({
            id: message.ClientObject.id,
            password: message.ClientObject.password
          });
        }, 500);
      } else {
        this.Client.UI.showInfoWindow('registration', false);
        return document.getElementById('clientStatus').innerHTML = 'Registration ok';
      }
    };

    CClientManager.prototype.setOnline = function(data) {
      if (this.authentification(data)) {
        return this.Client.IO.send({
          header: 'setOnline',
          id: data.id,
          password: data.password
        });
      } else {
        return this.Client.UI.showInfoWindow('login', false);
      }
    };

    CClientManager.prototype.getOnline = function(message) {
      this.Client.UI.gotoMainMenu('getOnline');
      if (message.result) {
        this.Client.ClientManager.update(message.ClientObject);
        return $('#clientStatus').html('<span>' + this.ClientObject.id + '</span>&nbsp;<span style="color:#0f0;">' + this.ClientObject.status + '</span>');
      } else {
        return this.Client.UI.showInfoWindow('login', false);
      }
    };

    CClientManager.prototype.setOffline = function() {
      return this.Client.IO.send({
        header: 'setOffline'
      });
    };

    CClientManager.prototype.getOffline = function(message) {
      this.Client.UI.gotoAuthMenu();
      if (message.result) {
        return document.getElementById('clientStatus').innerHTML = '';
      }
    };

    CClientManager.prototype.setJoinGame = function(data) {
      return this.Client.IO.send({
        header: 'setJoinGame',
        modelID: this.modelID
      });
    };

    CClientManager.prototype.getJoinGame = function(message) {
      if (message.result) {
        this.Client.ClientManager.update(message.ClientObject);
        this.Client.ClientManager.setLoadGame();
        return document.getElementById('clientStatus').innerHTML = this.ClientObject.id + ' ' + this.ClientObject.status + ' ' + this.Client.GameManager.GameObject.id;
      }
    };

    CClientManager.prototype.setLoadGame = function() {
      this.Client.GameManager.loadGame();
      return this.Client.IO.send({
        header: 'setLoadGame'
      });
    };

    CClientManager.prototype.getLoadGame = function(message) {
      if (message.result) {
        this.Client.ClientManager.update(message.ClientObject);
        return document.getElementById('clientStatus').innerHTML = this.ClientObject.id + ' ' + this.ClientObject.status + ' ' + this.Client.GameManager.GameObject.id;
      }
    };

    CClientManager.prototype.setReadyGame = function() {
      return this.Client.IO.send({
        header: 'setReadyGame'
      });
    };

    CClientManager.prototype.getReadyGame = function(message) {
      if (message.result) {
        this.Client.ClientManager.update(message.ClientObject);
        return document.getElementById('clientStatus').innerHTML = this.ClientObject.id + ' ' + this.ClientObject.status + ' ' + this.Client.GameManager.GameObject.id;
      }
    };

    CClientManager.prototype.setLeaveGame = function() {
      return this.Client.IO.send({
        header: 'setLeaveGame'
      });
    };

    CClientManager.prototype.getLeaveGame = function(message) {
      this.Client.UI.gotoMainMenu('getLeaveGame');
      if (message.result) {
        if (this.Client.GameManager.GameBool) {
          this.Client.GameManager.stopGame();
        }
        this.Client.ClientManager.update(message.ClientObject);
        return document.getElementById('clientStatus').innerHTML = this.ClientObject.id + ' ' + this.ClientObject.status;
      }
    };

    return CClientManager;

  })();

  window.CClientManager = CClientManager;

}).call(this);
