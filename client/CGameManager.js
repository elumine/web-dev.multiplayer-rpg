(function() {
  var CGameManager;

  CGameManager = (function() {
    function CGameManager(options) {
      this.GameObject = false;
      this.ping = {
        previousTime: new Date().getMilliseconds(),
        currentTime: 0,
        value: 0
      };
    }

    CGameManager.prototype.getCharacter = function() {
      var character, _i, _len, _ref;
      if (this.GameObject) {
        _ref = this.GameObject.characterArray;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          character = _ref[_i];
          if (character.ClientID === this.Client.ClientManager.ClientObject.id) {
            return character;
          }
        }
      } else {
        return false;
      }
    };

    CGameManager.prototype.loadGame = function() {
      var character, data, i, _i, _len, _ref,
        _this = this;
      this.Client.UI.showLoadWindow();
      data = '';
      _ref = this.GameObject.characterArray;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        character = _ref[i];
        data += '<div class="mainMenu_loadWindow_charactersItem" style="top: ' + 10 * i + '%">';
        data += '<div class="mainMenu_loadWindow_charactersItemLabel">' + character.ClientID + '</div>';
        data += '<div class="mainMenu_loadWindow_charactersItemProgressWrapper">';
        data += '<div class="mainMenu_loadWindow_charactersItemProgressBar"></div>';
        data += '</div>';
        data += '</div>';
      }
      $('#mainMenu_loadWindow_characters').html(data);
      $('.mainMenu_loadWindow_charactersItemProgressBar').each(function() {
        return $(this).animate({
          width: '100%'
        }, 2000 * (Math.random() * 0.5 + 0.5));
      });
      return setTimeout(function() {
        return _this.Client.ClientManager.setReadyGame();
      }, 2000);
    };

    CGameManager.prototype.startGame = function() {
      this.GameBool = true;
      this.Client.GraphicEngine.start();
      this.Client.InputController.enable();
      this.Client.UI.hideLoadWindow();
      this.Client.UI.gotoGameMenu();
      return console.log('start game');
    };

    CGameManager.prototype.stopGame = function() {
      this.GameBool = false;
      this.Client.GraphicEngine.stop();
      this.Client.InputController.disable();
      return console.log('stop game');
    };

    CGameManager.prototype.roundPrepair = function() {
      var _this = this;
      console.log('roundPrepair');
      this.Client.UI.abilitiesMenu.activeItem = false;
      this.Client.UI.abilitiesMenu.selected = false;
      this.Client.UI.showAbilitiesMenu();
      return setTimeout(function() {
        document.getElementById('soundWrapper_announcer_prepair').play();
        return _this.Client.UI.showAnouncement('prepair');
      }, 500);
    };

    CGameManager.prototype.roundPrepairEnd = function() {
      var defaultAbilityID;
      if (!this.Client.UI.abilitiesMenu.selected) {
        if (this.Client.UI.abilitiesMenu.activeItem) {
          defaultAbilityID = this.Client.UI.abilitiesMenu.activeItem;
        } else {
          defaultAbilityID = $('.gameMenu_abilitiesMenu_item')[0].attributes.ability.value;
        }
        return this.Client.InputController.send({
          type: 'selectAbilityDefault',
          id: defaultAbilityID
        });
      }
    };

    CGameManager.prototype.roundFight = function() {
      console.log('roundFight');
      document.getElementById('soundWrapper_announcer_fight').play();
      this.Client.UI.hideAbilitiesMenu();
      return this.Client.UI.showAnouncement('fight');
    };

    CGameManager.prototype.roundEnd = function() {
      return console.log('roundEnd', this.GameObject);
    };

    CGameManager.prototype.endGame = function(message) {
      var characterArray;
      this.stopGame();
      document.getElementById('soundWrapper_announcer_end').play();
      characterArray = message.GameObject.characterArray.sort(function(a, b) {
        if (a.points < b.points) {
          return 1;
        } else if (a.points > b.points) {
          return -1;
        } else {
          return 0;
        }
      });
      return this.Client.UI.showStatisticMenu(characterArray);
    };

    CGameManager.prototype.update = function(GameObject) {
      var sound, _i, _len, _ref;
      this.GameObject = GameObject;
      if (this.GameObject.soundArray) {
        _ref = this.GameObject.soundArray;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sound = _ref[_i];
          this.Client.SoundEngine.soundArray.push(sound);
        }
        this.Client.SoundEngine.handle();
      }
      if (this.GameObject) {
        document.getElementById('gameStatus').innerHTML = this.GameObject.id + " : " + this.GameObject.status;
      } else {
        document.getElementById('gameStatus').innerHTML = '';
      }
      this.ping.currentTime = new Date().getMilliseconds();
      this.ping.value = this.ping.currentTime - this.ping.previousTime;
      this.ping.previousTime = this.ping.currentTime;
      return document.getElementById('ping').innerHTML = this.ping.value;
    };

    return CGameManager;

  })();

  window.CGameManager = CGameManager;

}).call(this);
