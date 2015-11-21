(function() {
  var CModel, fs;

  fs = require('fs');

  CModel = (function() {
    function CModel(options) {}

    CModel.prototype.setClient = function(ClientObject) {
      return fs.writeFile("model/client/" + ClientObject.id, JSON.stringify(ClientObject));
    };

    CModel.prototype.getClient = function(ClientFileName) {
      if (JSON.parse(fs.readFileSync("model/client/" + ClientFileName))) {
        return JSON.parse(fs.readFileSync("model/client/" + ClientFileName));
      }
    };

    CModel.prototype.getClientList = function() {
      return fs.readdirSync('model/client');
    };

    return CModel;

  })();

  module.exports = CModel;

}).call(this);
