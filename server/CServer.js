(function() {
  var CServer;

  CServer = (function() {
    function CServer(options) {
      this.WebServer = options.WebServer, this.ClientManager = options.ClientManager, this.GameManager = options.GameManager, this.Model = options.Model, this.IO = options.IO;
      this.WebServer.Server = this;
      this.ClientManager.Server = this;
      this.GameManager.Server = this;
      this.Model.Server = this;
      this.IO.Server = this;
      this.ClientManager.setClientArray();
    }

    return CServer;

  })();

  module.exports = CServer;

}).call(this);
