(function() {
  var CIO;

  CIO = (function() {
    function CIO(options) {
      this.connect();
    }

    CIO.prototype.connect = function() {
      var _this = this;
      this.socket = new WebSocket("ws://localhost:5000");
      this.socket.onopen = function(event) {
        return $('#serverStatus').css('color', '#0f0').html('online');
      };
      this.socket.onclose = function(event) {
        setTimeout(function() {
          return _this.connect();
        }, 100);
        $('#serverStatus').css('color', '#f00').html('offline');
        if (_this.Client.GameManager.GameBool) {
          _this.Client.GameManager.endGame();
        }
        if (_this.Client.ClientManager.ClientObject) {
          return _this.Client.ClientManager.getOffline({
            result: true
          });
        }
      };
      return this.socket.onmessage = function(event) {
        return _this.recive(JSON.parse(event.data));
      };
    };

    CIO.prototype.send = function(message) {
      if (this.socket.readyState === 1) {
        return this.socket.send(JSON.stringify(message));
      }
    };

    CIO.prototype.recive = function(message) {
      switch (message.header) {
        case 'setRegistration':
          return this.Client.ClientManager.getRegistration(message);
        case 'setOnline':
          return this.Client.ClientManager.getOnline(message);
        case 'setOffline':
          return this.Client.ClientManager.getOffline(message);
        case 'setJoinGame':
          return this.Client.ClientManager.getJoinGame(message);
        case 'setLoadGame':
          return this.Client.ClientManager.getLoadGame(message);
        case 'setReadyGame':
          return this.Client.ClientManager.getReadyGame(message);
        case 'setLeaveGame':
          return this.Client.ClientManager.getLeaveGame(message);
        case 'massDelivery':
          return this.Client.GameManager.update(message.GameObject);
        case 'startGame':
          return this.Client.GameManager.startGame();
        case 'roundPrepair':
          return this.Client.GameManager.roundPrepair();
        case 'roundPrepairEnd':
          return this.Client.GameManager.roundPrepairEnd();
        case 'roundFight':
          return this.Client.GameManager.roundFight();
        case 'roundEnd':
          return this.Client.GameManager.roundEnd();
        case 'endGame':
          return this.Client.GameManager.endGame(message);
      }
    };

    return CIO;

  })();

  window.CIO = CIO;

}).call(this);
