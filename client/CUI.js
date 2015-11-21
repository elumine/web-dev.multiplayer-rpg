(function() {
  var CUI;

  CUI = (function() {
    function CUI(options) {
      var _this = this;
      this.abilitiesMenu = {
        selected: false,
        activeItem: false
      };
      this.gameMenu = {
        UserBar: {
          abilities: {
            mainAbility: 1
          }
        }
      };
      this.language = 'en';
      this.scaleWrapper();
      $(window).bind('resize', function() {
        return _this.scaleWrapper();
      });
      setTimeout(function() {
        $('#preloader').fadeOut(1000);
        return setTimeout(function() {
          return $('#authMenu, #infoBar, #localizationMenu').fadeIn(1000);
        }, 1250);
      }, 3000);
      this.ui_localization(this.language);
      $('#authMenu_buttonTrailer, #mainMenu_buttonTrailer').bind('click', function() {
        $('#poster').animate({
          left: '35%',
          top: '25%',
          width: '30%',
          height: '50%',
          opacity: 0
        }, 0).show().animate({
          left: '25%',
          top: '15%',
          width: '50%',
          height: '70%',
          opacity: 1
        }, 500);
        $('#globalShader').fadeIn(250);
        return setTimeout(function() {
          $('#poster').animate({
            left: '35%',
            top: '25%',
            width: '30%',
            height: '50%',
            opacity: 0
          }, 500);
          return $('#globalShader').fadeOut(500);
        }, 1500);
      });
      $('#localizationMenu').bind('mouseover', function() {
        return $('.localizationMenuWrapperPassive').show();
      });
      $('#localizationMenu').bind('mouseout', function() {
        return $('.localizationMenuWrapperPassive').hide();
      });
      $('.localizationMenuWrapper > .localizationMenu_item').bind('click', function(e) {
        $('.localizationMenuWrapperActive').each(function() {
          return $(this).removeClass('localizationMenuWrapperActive').addClass('localizationMenuWrapperPassive');
        });
        $(e.target).parent().removeClass('localizationMenuWrapperPassive').addClass('localizationMenuWrapperActive');
        return _this.ui_localization($(e.target).attr('value'));
      });
      $('#authMenu_buttonRegister').bind('click', function() {
        return _this.Client.ClientManager.setRegistration({
          id: $('#authMenu_textareaLogin').val(),
          password: $('#authMenu_textareaPassword').val()
        });
      });
      $('#authMenu_buttonLogin').bind('click', function() {
        return _this.Client.ClientManager.setOnline({
          id: $('#authMenu_textareaLogin').val(),
          password: $('#authMenu_textareaPassword').val()
        });
      });
      $('#mainMenu_buttonLogout').bind('click', function() {
        return _this.Client.ClientManager.setOffline();
      });
      $('#mainMenu_buttonJoinGame').bind('click', function() {
        return _this.Client.ClientManager.setJoinGame();
      });
      $('#mainMenu_buttonLeaveGame').bind('click', function() {
        return _this.Client.ClientManager.setLeaveGame();
      });
      $('#mainMenu_buttonGameMenu').bind('click', function() {
        return _this.gotoGameMenu();
      });
      $('#gameMenu_buttonMainMenu').bind('click', function() {
        return _this.gotoMainMenu('gameMenu_buttonMainMenu');
      });
      $('#gameMenu_abilitiesMenu_button > .text').bind('click', function() {
        if (_this.abilitiesMenu.activeItem) {
          _this.abilitiesMenu.selected = true;
          _this.Client.InputController.selectAbility(_this.abilitiesMenu.activeItem);
          return _this.hideAbilitiesMenu();
        }
      });
      $('#gameMenu_statisticMenu_button > .text').bind('click', function() {
        _this.Client.ClientManager.setLeaveGame();
        return _this.hideStatisticMenu();
      });
      $('.gameMenu_userBar_abilities_item_bg').bind('click', function(e) {
        return _this.Client.InputController.fireAbility($(e.target.parentNode).attr('abilityIndex'));
      });
      $('.gameMenu_userBar_abilities_item_bg').bind('mousemove', function(e) {
        return $('#gameMenu_userBar_abilities_item_label').show().animate({
          top: e.clientY - 50,
          left: e.clientX + 10
        }, 0).html(localization.abilities_description[e.target.parentNode.attributes.label.value][_this.language]);
      });
      $('.gameMenu_userBar_abilities_item_bg').bind('mouseout', function(e) {
        return $('#gameMenu_userBar_abilities_item_label').hide();
      });
      $('.gameMenu_abilitiesMenu_item').bind('mousemove', function(e) {
        return $('#gameMenu_userBar_abilities_item_label').show().animate({
          top: e.clientY - 50,
          left: e.clientX + 10
        }, 0).html(localization.abilities_description[e.target.attributes.ability.value][_this.language]);
      });
      $('.gameMenu_abilitiesMenu_item').bind('mouseout', function(e) {
        return $('#gameMenu_userBar_abilities_item_label').hide();
      });
      $('.modelSetItem').bind('click', function(e) {
        if (!$(e.target).hasClass('modelSetItemSelected')) {
          $('.modelSetItem').each(function() {
            return $(this).removeClass('modelSetItemSelected');
          });
          $(e.target).addClass('modelSetItemSelected');
          _this.Client.ClientManager.modelID = $(e.target).attr('value');
          $('#mainMenu_characterModel').fadeOut(500);
          return setTimeout(function() {
            _this.stopMainMenuModelAnimation();
            _this.startMainMenuModelAnimation();
            return $('#mainMenu_characterModel').fadeIn(500);
          }, 500);
        }
      });
      $('.ui_button1, .ui_button2, .ui_button3').bind('click', function() {
        return document.getElementById('soundWrapper_ui_button-click').play();
      });
    }

    CUI.prototype.scaleWrapper = function() {
      var dh, dw, h, l, t, w;
      dh = $(document).height();
      dw = $(document).width();
      w = dw;
      h = w / 2;
      if (h <= dh) {
        l = 0;
        t = (dh - h) / 2;
        return $('#wrapper').css('width', w).css('height', h).css('top', t).css('left', l);
      } else {
        h = dh;
        w = h * 2;
        t = 0;
        l = (dw - w) / 2;
        return $('#wrapper').css('width', w).css('height', h).css('top', t).css('left', l);
      }
    };

    CUI.prototype.gotoAuthMenu = function() {
      $('#mainMenu, #gameMenu, .localizationMenu_bg').hide();
      $('#authMenu').show();
      this.stopMainMenuModelAnimation();
      document.getElementById('soundWrapper_music_auth').play();
      document.getElementById('soundWrapper_music_main').pause();
      return document.getElementById('soundWrapper_music_game').pause();
    };

    CUI.prototype.gotoMainMenu = function(sender) {
      $('#authMenu, #gameMenu').hide();
      $('#mainMenu, .localizationMenu_bg').show();
      if (sender === 'gameMenu_buttonMainMenu') {
        $('#mainMenu_buttonJoinGame').hide();
        $('#mainMenu_buttonGameMenu, #mainMenu_buttonLeaveGame').show();
      } else if (sender === 'getOnline' || sender === 'getLeaveGame') {
        this.hideStatisticMenu();
        $('#mainMenu_buttonGameMenu, #mainMenu_buttonLeaveGame').hide();
        $('#mainMenu_buttonJoinGame').show();
      }
      this.stopMainMenuModelAnimation();
      this.startMainMenuModelAnimation();
      document.getElementById('soundWrapper_music_auth').pause();
      document.getElementById('soundWrapper_music_main').play();
      return document.getElementById('soundWrapper_music_game').pause();
    };

    CUI.prototype.gotoGameMenu = function() {
      $('#authMenu, #mainMenu').hide();
      $('#gameMenu, #gameMenu_buttonMainMenu').show();
      this.stopMainMenuModelAnimation();
      document.getElementById('soundWrapper_music_auth').pause();
      document.getElementById('soundWrapper_music_main').pause();
      return document.getElementById('soundWrapper_music_game').play();
    };

    CUI.prototype.showInfoWindow = function(target, flag) {
      var _this = this;
      $('#infoWindow').hide().fadeIn(500);
      $('.infoWindowLabel').hide();
      switch (target) {
        case 'registration':
          switch (flag) {
            case true:
              $('#infoWindowRegistrationTrue').show();
              break;
            case false:
              $('#infoWindowRegistrationFalse').show();
          }
          break;
        case 'login':
          switch (flag) {
            case false:
              $('#infoWindowLoginFalse').show();
          }
      }
      return setTimeout(function() {
        return $('#infoWindow').fadeOut(500);
      }, 1500);
    };

    CUI.prototype.showLoadWindow = function() {
      return $('#mainMenu_loadWindow').show();
    };

    CUI.prototype.hideLoadWindow = function() {
      return $('#mainMenu_loadWindow').hide();
    };

    CUI.prototype.startMainMenuModelAnimation = function() {
      var canvas, ctx, frameX, sprite,
        _this = this;
      canvas = document.getElementById('mainMenu_characterModel_canvas');
      canvas.width = $(canvas).width();
      canvas.height = $(canvas).height();
      ctx = canvas.getContext('2d');
      sprite = this.Client.AssetManager.SpriteArray[this.Client.ClientManager.modelID + '_preview'];
      frameX = 0;
      return this.mainMenuModelAnimationInterval = setInterval(function() {
        if (sprite.width * frameX >= sprite.image.width || frameX >= 24) {
          frameX = 0;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprite.image, sprite.width * frameX, 0, sprite.width, sprite.height, 0, 0, canvas.width, canvas.height);
        return frameX++;
      }, 80);
    };

    CUI.prototype.stopMainMenuModelAnimation = function() {
      return clearInterval(this.mainMenuModelAnimationInterval);
    };

    CUI.prototype.showAbilitiesMenu = function() {
      var abilitiesArray, abilityID, counter, item, learnedAbilityID, selector, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2,
        _this = this;
      $('#gameMenu_abilitiesMenu').show();
      abilitiesArray = [];
      _ref = this.Client.AssetManager.AbilitiesArray;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        abilityID = _ref[_i];
        abilitiesArray.push(abilityID);
      }
      for (_j = 0, _len1 = abilitiesArray.length; _j < _len1; _j++) {
        abilityID = abilitiesArray[_j];
        _ref1 = this.Client.GameManager.getCharacter().abilities;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          learnedAbilityID = _ref1[_k];
          if (abilityID === learnedAbilityID) {
            abilitiesArray.splice(abilitiesArray.indexOf(abilityID), 1);
          }
        }
      }
      _ref2 = $('.gameMenu_abilitiesMenu_item');
      for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
        item = _ref2[_l];
        $(item).hide().attr('ability', 'none');
      }
      counter = 1;
      for (_m = 0, _len4 = abilitiesArray.length; _m < _len4; _m++) {
        abilityID = abilitiesArray[_m];
        selector = "#gameMenu_abilitiesMenu_item" + counter;
        if (counter === 1) {
          $(selector).addClass('gameMenu_abilitiesMenu_item-active');
        }
        counter++;
        $(selector).show().attr('src', 'assets/ui/' + abilityID + '-icon.png').attr('ability', abilityID);
      }
      return $('.gameMenu_abilitiesMenu_item').bind('click', function(e) {
        var _len5, _n, _ref3;
        _ref3 = $('.gameMenu_abilitiesMenu_item');
        for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
          item = _ref3[_n];
          $(item).removeClass('gameMenu_abilitiesMenu_item-active');
        }
        $(e.target).addClass('gameMenu_abilitiesMenu_item-active');
        return _this.abilitiesMenu.activeItem = e.target.attributes.ability.value;
      });
    };

    CUI.prototype.hideAbilitiesMenu = function() {
      return $('#gameMenu_abilitiesMenu').hide();
    };

    CUI.prototype.showStatisticMenu = function(characterArray) {
      var character, value, _i, _len;
      $('#gameMenu_statisticMenu').show();
      value = '';
      for (_i = 0, _len = characterArray.length; _i < _len; _i++) {
        character = characterArray[_i];
        value += 'Character ' + character.ClientID + ' ' + character.points + ' points<br>';
      }
      return $('#gameMenu_statisticMenu_wrapper').html('').html(value);
    };

    CUI.prototype.hideStatisticMenu = function() {
      return $('#gameMenu_statisticMenu').hide();
    };

    CUI.prototype.showAnouncement = function(value) {
      var _this = this;
      $('#anouncement_' + value).show();
      return setTimeout(function() {
        return $('#anouncement_' + value).hide();
      }, 1500);
    };

    CUI.prototype.ui_localization = function(language) {
      this.language = language;
      return $('.ui_localization-wrapper').each(function() {
        return $(this).html(localization[$(this).attr('id')][language]);
      });
    };

    return CUI;

  })();

  window.CUI = CUI;

}).call(this);
