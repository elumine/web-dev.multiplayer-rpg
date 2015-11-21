(function() {
  var CWebServer, Static, http;

  http = require('http');

  Static = require('node-static');

  CWebServer = (function() {
    function CWebServer(options) {
      var _this = this;
      this.fileServer = new Static.Server('.');
      this.httpServer = http.createServer(function(req, res) {
        return _this.fileServer.serve(req, res);
      });
      this.httpServer.listen(3000);
      console.log("WebServer.httpServer runnig at " + 3000);
    }

    return CWebServer;

  })();

  module.exports = CWebServer;

}).call(this);
