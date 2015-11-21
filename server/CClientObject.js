(function() {
  var CClientObject;

  CClientObject = (function() {
    function CClientObject(options) {
      this.id = options.id, this.password = options.password;
      this.status = 'offlane';
    }

    return CClientObject;

  })();

  module.exports = CClientObject;

}).call(this);
