(function() {
  var CInputController;

  CInputController = (function() {
    function CInputController() {}

    CInputController.prototype.send = function(event) {
      return this.Client.IO.send({
        header: 'InputController',
        event: event
      });
    };

    CInputController.prototype.selectAbility = function(id) {
      return this.send({
        type: 'selectAbility',
        id: id
      });
    };

    CInputController.prototype.fireAbility = function(id) {
      var character;
      character = this.Client.GameManager.getCharacter();
      if (!character.cooldowns[id] || character.cooldowns[id] && character.cooldowns[id].value <= 0) {
        return this.send({
          type: 'ability',
          id: id
        });
      }
    };

    CInputController.prototype.enable = function() {
      var _this = this;
      this.inputInterval = setInterval(function() {
        var character;
        character = _this.Client.GameManager.getCharacter();
        if (character) {
          if (character.model.state.id === 'stand' || character.model.state.id === 'move') {
            return _this.inputBool = true;
          } else if (character.model.state.id === 'ability') {
            return _this.inputBool = false;
          }
        }
      }, 20);
      this.Client.GraphicEngine.canvas.addEventListener('mousedown', this.fn_mousedown = function(event) {
        _this.mousedown = true;
        _this.fn_mousemove(event);
        if (_this.inputBool) {
          return _this.send({
            type: 'move'
          });
        }
      });
      this.Client.GraphicEngine.canvas.addEventListener('mouseup', this.fn_mouseup = function(event) {
        _this.mousedown = false;
        if (_this.inputBool) {
          return _this.send({
            type: 'stand'
          });
        }
      });
      this.Client.GraphicEngine.canvas.addEventListener('mousemove', this.fn_mousemove = function(event) {
        var angle_deg, character, vd, vx, x, y;
        if (_this.mousedown) {
          character = _this.Client.GameManager.getCharacter();
          x = event.offsetX - _this.Client.GraphicEngine.canvas.width / 2;
          y = event.offsetY - _this.Client.GraphicEngine.canvas.height / 2;
          vd = [x, y];
          vx = [1, 0];
          vd = Math.normalize(vd);
          angle_deg = Math.vector_angle(vd, vx);
          if (vd[1] < 0) {
            angle_deg = 360 - angle_deg;
          }
          return _this.send({
            type: 'direction',
            direction: {
              vector: vd,
              angle: angle_deg
            }
          });
        }
      });
      return window.addEventListener('keypress', this.fn_keypress = function(event) {
        if (_this.inputBool) {
          _this.inputBool = false;
          switch (event.keyCode) {
            case 49:
              return _this.fireAbility(0);
            case 50:
              return _this.fireAbility(1);
            case 51:
              return _this.fireAbility(2);
            case 52:
              return _this.fireAbility(3);
            case 53:
              return _this.fireAbility(4);
          }
        }
      });
    };

    CInputController.prototype.disable = function() {
      clearInterval(this.inputInterval);
      this.Client.GraphicEngine.canvas.removeEventListener('mousedown', this.fn_mousedown);
      this.Client.GraphicEngine.canvas.removeEventListener('mouseup', this.fn_mouseup);
      this.Client.GraphicEngine.canvas.removeEventListener('mousemove', this.fn_mousemove);
      return window.removeEventListener('keypress', this.fn_keypress);
    };

    return CInputController;

  })();

  window.CInputController = CInputController;

}).call(this);
