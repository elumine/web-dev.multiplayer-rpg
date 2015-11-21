(function() {
  var CGraphicEngine;

  CGraphicEngine = (function() {
    function CGraphicEngine(options) {
      var _this = this;
      this.canvas = options.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.fps = {
        previous: 0,
        current: 0,
        value: 0
      };
      this.mode = {
        basic: false
      };
      this.canvas.width = $(this.canvas.parentNode).width();
      this.canvas.height = $(this.canvas.parentNode).height();
      $(window).bind('resize', function() {
        _this.canvas.width = $(_this.canvas.parentNode).width();
        return _this.canvas.height = $(_this.canvas.parentNode).height();
      });
      this.fullscreen = false;
      this.camera = {
        x: 0,
        y: 0,
        width: 1000,
        height: 500
      };
    }

    CGraphicEngine.prototype.start = function() {
      this.renderInterval = requestAnimationFrame(this.render.bind(this));
      return this.enableGameMenuUserBarHpAnimation();
    };

    CGraphicEngine.prototype.stop = function() {
      cancelAnimationFrame(this.renderInterval);
      return clearInterval(this.animationInterval);
    };

    CGraphicEngine.prototype.render = function() {
      var ability, character, i, item, items, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3;
      this.GameObject = this.Client.GameManager.GameObject;
      if (this.GameObject) {
        this.camera.scale = this.canvas.width / this.camera.width;
        _ref = this.GameObject.characterArray;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          character = _ref[_i];
          if (character.ClientID === this.Client.ClientManager.ClientObject.id) {
            this.camera.x = gameToScreen(character.model.x - this.camera.width / 2);
            this.camera.y = gameToScreen(character.model.y - this.camera.height / 2);
          }
        }
        this.fps.current = new Date().getMilliseconds();
        this.fps.value = (1000 / (this.fps.current - this.fps.previous)).toFixed(0);
        this.fps.previous = this.fps.current;
        document.getElementById('fps').innerHTML = this.fps.value;
        items = [];
        _ref1 = this.GameObject.characterArray;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          character = _ref1[_j];
          if (!character.dead) {
            items.push(character);
          }
        }
        _ref2 = this.GameObject.abilitiesArray;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          ability = _ref2[_k];
          items.push(ability);
        }
        items.sort(function(a, b) {
          if (a.model.y < b.model.y) {
            return -1;
          } else if (a.model.y > b.model.y) {
            return 1;
          } else {
            return 0;
          }
        });
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWater(this.GameObject.level)
        this.drawGound(this.GameObject.level)
        for (_l = 0, _len3 = items.length; _l < _len3; _l++) {
          item = items[_l];
          this.drawItem(item);
        }
        _ref3 = this.GameObject.characterArray;
        for (i = _m = 0, _len4 = _ref3.length; _m < _len4; i = ++_m) {
          character = _ref3[i];
          this.drawCharactersUI(character);
          if (character.ClientID === this.Client.ClientManager.ClientObject.id) {
            this.drawCharacterUI(character);
          }
        }
        this.drawStatisticTable(this.GameObject.characterArray);
        if (this.GameObject.data.round.array[this.GameObject.data.round.current]) {
          $('#gameMenu_timeBar').html((this.GameObject.data.round.array[this.GameObject.data.round.current].time / 1000).toFixed(0));
        }
        return this.renderInterval = requestAnimationFrame(this.render.bind(this));
      }
    };

    CGraphicEngine.prototype.enableGameMenuUserBarHpAnimation = function() {
      var canvas, ctx, frameX, sprite,
        _this = this;
      canvas = document.getElementById('gameMenu_userBar_hp_canvas');
      canvas.width = $(canvas).width();
      canvas.height = $(canvas).height();
      ctx = canvas.getContext('2d');
      sprite = this.Client.AssetManager.SpriteArray.hpAnimation;
      frameX = 0;
      return this.animationInterval = setInterval(function() {
        if (sprite.width * frameX >= sprite.image.width || frameX > 109) {
          frameX = 0;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprite.image, sprite.width * frameX, 0, sprite.width, sprite.height, 0, 0, canvas.width, canvas.height);
        return frameX++;
      }, 24);
    };

    CGraphicEngine.prototype.drawWater = function(level) {
      var frameX, height1, height2, i, j, sprite, width1, width2, x_length, x_reflection, y_length, y_reflection, _i, _results;
      sprite = this.Client.AssetManager.SpriteArray[level.id + '_water'];
      frameX = parseInt(level.water.state.time / (level.water.state.duration / sprite.frames)).toFixed(0);
      width1 = sprite.width;
      height1 = sprite.height;
      x_length = (level.width / width1).toFixed(0);
      y_length = (level.height / height1).toFixed(0);
      width2 = level.width / x_length;
      height2 = level.height / y_length;
      _results = [];
      for (i = _i = 0; _i < x_length; i = _i += 1) {
        if (i % 2 !== 0) {
          x_reflection = -1;
        } else {
          x_reflection = 1;
        }
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (j = _j = 0; _j < y_length; j = _j += 1) {
            if (j % 2 !== 0) {
              y_reflection = -1;
            } else {
              y_reflection = 1;
            }
            this.ctx.save();
            this.ctx.translate(gameToScreen(width2 * i + width2 / 2) - this.camera.x, gameToScreen(height2 * j + height2 / 2) - this.camera.y);
            this.ctx.scale(x_reflection, y_reflection);
            this.drawSprite(sprite, frameX, 0, gameToScreen(-width2 / 2), gameToScreen(-height2 / 2), gameToScreen(width2), gameToScreen(height2));
            _results1.push(this.ctx.restore());
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    CGraphicEngine.prototype.drawGound = function(level) {
      var frameX, sprite;
      sprite = this.Client.AssetManager.SpriteArray[level.id + '_ground'];
      frameX = 0;
      return this.drawSprite(sprite, frameX, 0, gameToScreen(level.safeZone.cx - level.safeZone.rx) - this.camera.x, gameToScreen(level.safeZone.cy - level.safeZone.ry) - this.camera.y, gameToScreen(level.safeZone.rx * 2), gameToScreen(level.safeZone.ry * 2));
    };

    CGraphicEngine.prototype.drawItem = function(item) {
      var a, b, direction, directions, drawGraphicEffectDoubleFrontPart, frameX, frameY, graphicEffect, i, sprite, step, _i, _j, _k, _l, _len, _len1, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      drawGraphicEffectDoubleFrontPart = false;
      if (item.ClientID) {
        _ref = item.graphicEffects;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          graphicEffect = _ref[_i];
          if (graphicEffect.type === 'back') {
            this.ctx.beginPath();
            this.ctx.fillStyle = '#0f0';
            this.ctx.lineWidth = 1;
            this.ctx.arc(gameToScreen(item.model.x) - this.camera.x, gameToScreen(item.model.y) - this.camera.y, gameToScreen(graphicEffect.model.radius), 0, 2 * Math.PI, false);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.closePath();
          } else if (graphicEffect.type === 'double') {
            drawGraphicEffectDoubleFrontPart = true;
            this.ctx.beginPath();
            this.ctx.fillStyle = '#3f3';
            this.ctx.lineWidth = 1;
            this.ctx.arc(gameToScreen(item.model.x) - this.camera.x, gameToScreen(item.model.y) - this.camera.y, gameToScreen(graphicEffect.model.radius), Math.PI, 0, false);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.closePath();
          }
        }
      }
      if (this.mode.basic) {
        this.ctx.beginPath();
        this.ctx.fillStyle = '#00f';
        this.ctx.lineWidth = 1;
        this.ctx.arc(gameToScreen(item.model.x) - this.camera.x, gameToScreen(item.model.y) - this.camera.y, gameToScreen(item.model.radius), 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(gameToScreen(item.model.x) - this.camera.x - 1, gameToScreen(item.model.y) - this.camera.y - 1, 2, 2);
      } else {
        sprite = this.Client.AssetManager.SpriteArray[item.model.id];
        direction = 0;
        directions = (sprite.directions - 1) * 2;
        step = 360 / (directions * 2);
        if (item.direction.angle >= 270 && item.direction.angle <= 360) {
          a = 360 + step;
          for (i = _j = _ref1 = ((sprite.directions - 1) / 2) + 1, _ref2 = sprite.directions; _j <= _ref2; i = _j += 1) {
            b = a - step * 2;
            if (item.direction.angle <= a && item.direction.angle >= b) {
              direction = i - 1;
            }
            a = b;
          }
        }
        if (item.direction.angle <= 90 && item.direction.angle >= 0) {
          a = 90 + step;
          for (i = _k = 1, _ref3 = ((sprite.directions - 1) / 2) + 1; _k <= _ref3; i = _k += 1) {
            b = a - step * 2;
            if (item.direction.angle <= a && item.direction.angle >= b) {
              direction = i - 1;
            }
            a = b;
          }
        }
        if (item.direction.angle <= 180 && item.direction.angle >= 90) {
          a = 90 - step;
          for (i = _l = 1, _ref4 = ((sprite.directions - 1) / 2) + 1; _l <= _ref4; i = _l += 1) {
            b = a + step * 2;
            if (item.direction.angle >= a && item.direction.angle <= b) {
              direction = -(i - 1);
            }
            a = b;
          }
        }
        if (item.direction.angle <= 270 && item.direction.angle >= 180) {
          a = 180 - step;
          for (i = _m = _ref5 = ((sprite.directions - 1) / 2) + 1, _ref6 = sprite.directions; _m <= _ref6; i = _m += 1) {
            b = a + step * 2;
            if (item.direction.angle >= a && item.direction.angle <= b) {
              direction = -(i - 1);
            }
            a = b;
          }
        }
        frameX = parseInt(item.model.state.time / (item.model.state.duration / sprite.frames)).toFixed(0);
        if (direction < 0) {
          direction = -1 * direction;
          frameY = item.model.state.index * sprite.directions + direction;
          if (item.model.state.flat) {
            frameY = item.model.state.index * sprite.directions;
          }
          this.ctx.save();
          this.ctx.translate(gameToScreen(item.model.x) - this.camera.x, gameToScreen(item.model.y) - this.camera.y);
          this.ctx.scale(-1, 1);
          if (item.invisibility) {
            if (item.ClientID === this.Client.ClientManager.ClientObject.id) {
              this.ctx.globalAlpha = 0.5;
            } else {
              this.ctx.globalAlpha = 0;
            }
          }
          this.drawSprite(sprite, frameX, frameY, gameToScreen(-item.model.radius), gameToScreen(-item.model.radius), gameToScreen(item.model.radius) * 2, gameToScreen(item.model.radius) * 2);
          this.ctx.restore();
        } else {
          frameY = item.model.state.index * sprite.directions + direction;
          if (item.model.state.flat) {
            frameY = item.model.state.index * sprite.directions;
          }
          this.ctx.save();
          if (item.invisibility) {
            if (item.ClientID === this.Client.ClientManager.ClientObject.id) {
              this.ctx.globalAlpha = 0.5;
            } else {
              this.ctx.globalAlpha = 0;
            }
          }
          this.drawSprite(sprite, frameX, frameY, gameToScreen(item.model.x - item.model.radius) - this.camera.x, gameToScreen(item.model.y - item.model.radius) - this.camera.y, gameToScreen(item.model.radius) * 2, gameToScreen(item.model.radius) * 2);
          this.ctx.restore();
        }
      }
      if (drawGraphicEffectDoubleFrontPart) {
        this.ctx.beginPath();
        this.ctx.fillStyle = '#2f2';
        this.ctx.lineWidth = 1;
        this.ctx.arc(gameToScreen(item.model.x) - this.camera.x, gameToScreen(item.model.y) - this.camera.y, gameToScreen(graphicEffect.model.radius), 0, Math.PI, false);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
      }
      if (item.ClientID) {
        _ref7 = item.graphicEffects;
        for (_n = 0, _len1 = _ref7.length; _n < _len1; _n++) {
          graphicEffect = _ref7[_n];
          if (graphicEffect.type === 'front') {
            console.log('graphicEffect', graphicEffect);
            sprite = this.Client.AssetManager.SpriteArray[graphicEffect.model.id];
            frameX = parseInt(graphicEffect.model.state.time / (graphicEffect.model.state.duration / sprite.frames)).toFixed(0);
            frameY = 0;
            this.drawSprite(sprite, frameX, frameY, gameToScreen(item.model.x - graphicEffect.model.radius) - this.camera.x, gameToScreen(item.model.y - graphicEffect.model.radius) - this.camera.y, gameToScreen(graphicEffect.model.radius) * 2, gameToScreen(graphicEffect.model.radius) * 2);
          }
        }
        if (item.onwater.flag) {
          sprite = this.Client.AssetManager.SpriteArray.water_GraphicEffect;
          frameX = parseInt(item.onwater.model.state.time / (item.onwater.model.state.duration / sprite.frames)).toFixed(0);
          frameY = 0;
          return this.drawSprite(sprite, frameX, frameY, gameToScreen(item.model.x - item.onwater.model.radius) - this.camera.x, gameToScreen(item.model.y - item.onwater.model.radius) - this.camera.y, gameToScreen(item.onwater.model.radius) * 2, gameToScreen(item.onwater.model.radius) * 2);
        }
      }
    };

    CGraphicEngine.prototype.drawCharacterUI = function(character) {
      var ability, abilityItem, abilityItemSelector, abilityItem_bg, abilityItem_shader, cooldown_animation_k, counter, effect, effectItemSelector, i, item, transition_k, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
      _ref = $('.gameMenu_userBar_effects_item');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        $(item).hide();
      }
      counter = 1;
      _ref1 = character.effects;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        effect = _ref1[i];
        effectItemSelector = "#gameMenu_userBar_effects_item" + counter;
        counter++;
        if (effect.type !== 'effect') {
          $(effectItemSelector).show().attr('src', 'assets/ui/' + effect.abilityID + '-' + effect.type + '-icon.png');
        } else {
          $(effectItemSelector).show().attr('src', 'assets/ui/' + effect.abilityID + '-' + effect.data.value + '-icon.png');
        }
      }
      _ref2 = $('.gameMenu_userBar_abilities_item');
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        item = _ref2[_k];
        $(item).hide();
      }
      counter = 1;
      _ref3 = character.abilities;
      for (i = _l = 0, _len3 = _ref3.length; _l < _len3; i = ++_l) {
        ability = _ref3[i];
        if (i + 1 !== this.Client.UI.gameMenu.UserBar.abilities.mainAbility) {
          abilityItemSelector = "#gameMenu_userBar_abilities_item" + counter;
          counter++;
        } else if (i + 1 === this.Client.UI.gameMenu.UserBar.abilities.mainAbility) {
          abilityItemSelector = "#gameMenu_userBar_abilities_item5";
        }
        abilityItem = $(abilityItemSelector);
        abilityItem_shader = $(abilityItemSelector + ' > .gameMenu_userBar_abilities_item_shader');
        abilityItem_bg = $(abilityItemSelector + ' > .gameMenu_userBar_abilities_item_bg');
        abilityItem_bg.attr('src', 'assets/ui/' + ability + '-icon.png');
        abilityItem.show().attr('abilityIndex', i).attr('label', ability);
        cooldown_animation_k = 0;
        if (character.cooldowns[i]) {
          cooldown_animation_k = 100 * character.cooldowns[i].value / character.cooldowns[i].time;
        }
        abilityItem_shader.css('height', cooldown_animation_k + '%');
      }
      transition_k = 100 - (100 * character.hp.current / character.hp.max);
      return $('#gameMenu_userBar_hp_canvas').css('top', transition_k + '%');
    };

    CGraphicEngine.prototype.drawCharactersUI = function(character) {
      var bar_left_bottom, bar_left_up, bar_right_bottom1, bar_right_bottom2, bar_right_up1, bar_right_up2, fill1, fill2;
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "italic " + gameToScreen(10) + "px Arial";
      this.ctx.fillText(character.ClientID, gameToScreen(character.model.x + (-character.ClientID.length * 10) / 2) - this.camera.x, gameToScreen(character.model.y - 75) - this.camera.y);
      if (character.ClientID === this.Client.ClientManager.ClientObject.id) {
        fill1 = '#0f0';
        fill2 = '#5a5';
        this.ctx.font = "italic " + gameToScreen(8) + "px Arial";
        this.ctx.fillStyle = fill1;
        this.ctx.fillText(character.hp.current + '/' + character.hp.max, gameToScreen(character.model.x + character.model.radius) - this.camera.x, gameToScreen(character.model.y - 75) - this.camera.y);
      } else {
        fill1 = '#f00';
        fill2 = '#a55';
      }
      bar_left_up = [gameToScreen(character.model.x - character.model.radius) - this.camera.x, gameToScreen(character.model.y - character.model.radius - 15) - this.camera.y];
      bar_right_up2 = [gameToScreen(character.model.x + character.model.radius) - this.camera.x, gameToScreen(character.model.y - character.model.radius - 15) - this.camera.y];
      bar_right_bottom2 = [gameToScreen(character.model.x + character.model.radius) - this.camera.x, gameToScreen(character.model.y - character.model.radius - 10) - this.camera.y];
      bar_left_bottom = [gameToScreen(character.model.x - character.model.radius) - this.camera.x, gameToScreen(character.model.y - character.model.radius - 10) - this.camera.y];
      bar_right_up1 = [gameToScreen(character.model.x - character.model.radius + 2 * character.model.radius * (character.hp.current / character.hp.max)) - this.camera.x, gameToScreen(character.model.y - character.model.radius - 15) - this.camera.y];
      bar_right_bottom1 = [gameToScreen(character.model.x - character.model.radius + 2 * character.model.radius * (character.hp.current / character.hp.max)) - this.camera.x, gameToScreen(character.model.y - character.model.radius - 10) - this.camera.y];
      this.ctx.beginPath();
      this.ctx.moveTo(bar_left_up[0], bar_left_up[1]);
      this.ctx.lineTo(bar_right_up2[0], bar_right_up2[1]);
      this.ctx.lineTo(bar_right_bottom2[0], bar_right_bottom2[1]);
      this.ctx.lineTo(bar_left_bottom[0], bar_left_bottom[1]);
      this.ctx.lineTo(bar_left_up[0], bar_left_up[1]);
      this.ctx.closePath();
      this.ctx.fillStyle = fill2;
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.moveTo(bar_left_up[0], bar_left_up[1]);
      this.ctx.lineTo(bar_right_up1[0], bar_right_up1[1]);
      this.ctx.lineTo(bar_right_bottom1[0], bar_right_bottom1[1]);
      this.ctx.lineTo(bar_left_bottom[0], bar_left_bottom[1]);
      this.ctx.lineTo(bar_left_up[0], bar_left_up[1]);
      this.ctx.closePath();
      this.ctx.fillStyle = fill1;
      return this.ctx.fill();
    };

    CGraphicEngine.prototype.drawStatisticTable = function(characterArray) {
      var character, data, i, _i, _len;
      data = '';
      for (i = _i = 0, _len = characterArray.length; _i < _len; i = ++_i) {
        character = characterArray[i];
        data += '<div id="gameMenu_statisticTableItem' + i + '" class="gameMenu_statisticTableItem"><div class="gameMenu_statisticTableItemLeft">' + character.ClientID + '</div><div class="gameMenu_statisticTableItemRight">' + character.points + '</div></div>';
      }
      return $('#gameMenu_statisticTable').html(data);
    };

    CGraphicEngine.prototype.drawSprite = function(SpriteObject, frameX, frameY, x, y, width, height) {
      if (SpriteObject.width * frameX >= SpriteObject.image.width) {
        frameX = 0;
      }
      return this.ctx.drawImage(SpriteObject.image, SpriteObject.width * frameX, SpriteObject.height * frameY, SpriteObject.width, SpriteObject.height, x, y, width, height);
    };

    return CGraphicEngine;

  })();

  window.CGraphicEngine = CGraphicEngine;

}).call(this);
