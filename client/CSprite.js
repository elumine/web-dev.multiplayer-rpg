(function() {
  var CSprite;

  CSprite = (function() {
    function CSprite(options) {
      var _this = this;
      this.id = options.id, this.src = options.src, this.frames = options.frames, this.rows = options.rows, this.states = options.states, this.directions = options.directions;
      this.image = document.createElement('img');
      this.image.src = this.src;
      this.image.onload = function(event) {
        _this.height = _this.image.height / _this.rows;
        return _this.width = _this.image.width / _this.frames;
      };
    }

    return CSprite;

  })();

  window.CSprite = CSprite;

}).call(this);
