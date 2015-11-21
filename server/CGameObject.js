(function() {
  var Assets, CCharacter, CGameObject, CRound, common;

  CCharacter = require('./CCharacter');

  Assets = require('./Assets');

  common = require('./common');

  CGameObject = (function() {
    function CGameObject(options) {
      this.id = options.id, this.GameManager = options.GameManager;
      this.maxCharacters = 2;
      this.status = 'empty';
      this.characterArray = [];
      this.abilitiesArray = [];
      this.soundArray = [];
      this.data = {
        interval: {
          delay: {
            load: 100,
            game: 20
          }
        },
        round: {
          current: 0,
          max: 3,
          array: []
        },
        statistic: {}
      };
      this.temp = {
        uniqeAbilityIDCounter: 0
      };
      console.log('startGame', this.id);
    }

    CGameObject.prototype.addCharacter = function(ClientID, modelID) {
      var character;
      character = new CCharacter({
        ClientID: ClientID,
        model: Assets[modelID]()
      });
      this.characterArray.push(character);
      return this.GameLogic_handleEmpty();
    };

    CGameObject.prototype.clientEventHandler = function(ClientObject, event) {
      var character, effect, _i, _len, _ref, _results,
        _this = this;
      character = this.getCharacterByClientID(ClientObject.id);
      switch (event.type) {
        case 'direction':
          if (this.data.round.array[this.data.round.current].status !== 'prepair') {
            character.direction.vector = event.direction.vector;
            return character.direction.angle = event.direction.angle;
          }
          break;
        case 'stand':
          if (this.data.round.array[this.data.round.current].status !== 'prepair') {
            return character.model.state = character.model.states.stand;
          }
          break;
        case 'move':
          if (this.data.round.array[this.data.round.current].status !== 'prepair') {
            if (!character.stun && !character.root) {
              return character.model.state = character.model.states.move;
            }
          }
          break;
        case 'ability':
          if (this.data.round.array[this.data.round.current].status !== 'prepair') {
            if (!character.stun && !character.silence) {
              if (character.abilities[event.id]) {
                character.model.state = character.model.states.ability;
                character.abilityID = character.abilities[event.id];
                character.cooldownID = event.id;
                setTimeout(function() {
                  return character.model.state = character.model.states.stand;
                }, character.model.state.duration);
                _ref = character.effects;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  effect = _ref[_i];
                  if (effect.data.value === 'invisibility') {
                    _results.push(character.effects.splice(character.effects.indexOf(effect), 1));
                  } else {
                    _results.push(void 0);
                  }
                }
                return _results;
              }
            }
          }
          break;
        case 'selectAbility':
          if (this.data.round.array[this.data.round.current].status === 'prepair') {
            return character.abilities.push(event.id);
          }
          break;
        case 'selectAbilityDefault':
          console.log('selectAbilityDefault');
          return character.abilities.push(event.id);
      }
    };

    CGameObject.prototype.clientLeaveGame = function(ClientObject) {
      var character, characterIndex, i, _i, _len, _ref;
      characterIndex = 0;
      _ref = this.characterArray;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        character = _ref[i];
        if (character.ClientID === ClientObject.id) {
          characterIndex = i;
        }
      }
      this.characterArray.splice(characterIndex, 1);
      if (this.characterArray.length === 0 && this.status !== 'end') {
        return this.GameLogic_handleEnd();
      }
    };

    CGameObject.prototype.dropClientsFromGame = function() {
      var ClientSocketID, character;
      if (this.characterArray.length !== 0) {
        character = this.characterArray[0];
        console.log('dropClientsFromGame', character.ClientID);
        ClientSocketID = this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID;
        this.GameManager.Server.ClientManager.setLeaveGame(ClientSocketID);
        if (this.characterArray.length !== 0) {
          return this.dropClientsFromGame();
        }
      }
    };

    CGameObject.prototype.getCharacterByClientID = function(ClientID) {
      var character, _i, _len, _ref;
      _ref = this.characterArray;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        if (character.ClientID === ClientID) {
          return character;
        }
      }
    };

    CGameObject.prototype.getGameObject = function() {
      return {
        id: this.id,
        status: this.status,
        level: this.level,
        characterArray: this.characterArray,
        abilitiesArray: this.abilitiesArray,
        soundArray: this.soundArray,
        data: this.data
      };
    };

    CGameObject.prototype.GameLogic_handleEmpty = function() {
      console.log('GameLogic_handleEmpty');
      if (this.characterArray.length === this.maxCharacters) {
        this.GameLogic_handleLoad();
      }
      return this.massDelivery();
    };

    CGameObject.prototype.handleRoundTimeStart = function() {
      var _this = this;
      console.log('handleRoundTimeStart');
      return this.GameLoopTimeInterval = setInterval(function() {
        if (_this.data.round.array[_this.data.round.current].time) {
          return _this.data.round.array[_this.data.round.current].time -= 1000;
        }
      }, 1000);
    };

    CGameObject.prototype.handleRoundTimeStop = function() {
      console.log('handleRoundTimeStop');
      this.data.round.array[this.data.round.current].time = 0;
      return clearInterval(this.GameLoopTimeInterval);
    };

    CGameObject.prototype.GameLogic_handleLoad = function() {
      var _this = this;
      console.log('GameLogic_handleLoad');
      this.status = 'load';
      this.level = Assets.level0();
      return this.LoadLoopInterval = setInterval(function() {
        var character, temp, _i, _len, _ref;
        console.log('GameLogic_handleLoad - check');
        temp = true;
        _ref = _this.characterArray;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          character = _ref[_i];
          if (_this.GameManager.Server.ClientManager.ClientArray[character.ClientID].status !== 'readyGame') {
            temp = false;
          }
        }
        if (temp) {
          clearInterval(_this.LoadLoopInterval);
          _this.GameLogic_handleStart();
        }
        return _this.massDelivery();
      }, this.data.interval.delay.load);
    };

    CGameObject.prototype.GameLogic_handleStart = function() {
      var character, _i, _len, _ref, _results,
        _this = this;
      console.log('GameLogic_handleStart');
      this.status = 'start';
      this.GameLogic_handleRound();
      this.GameLoopInterval = setInterval(function() {
        _this.handleLevel(_this.data.interval.delay.game);
        _this.handleCharacters(_this.data.interval.delay.game);
        _this.handleAbilities(_this.data.interval.delay.game);
        return _this.massDelivery();
      }, this.data.interval.delay.game);
      _ref = this.characterArray;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        _results.push(this.GameManager.Server.IO.send(this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID, {
          header: 'startGame'
        }));
      }
      return _results;
    };

    CGameObject.prototype.GameLogic_handleRound = function() {
      console.log('GameLogic_handleRound');
      if (this.data.round.current < this.data.round.max) {
        this.data.round.array[this.data.round.current] = new CRound({
          number: this.data.round.current
        });
        return this.GameLogic_handleRoundPrepair();
      } else {
        return this.GameLogic_handleEnd();
      }
    };

    CGameObject.prototype.GameLogic_handleRoundPrepair = function() {
      var character, _i, _len, _ref, _results,
        _this = this;
      console.log('GameLogic_handleRoundPrepair');
      this.handleRoundTimeStop();
      this.handleRoundTimeStart();
      this.handleCharacters_spawn();
      this.abilitiesArray = [];
      this.temp.uniqeAbilityIDCounter = 0;
      this.data.round.array[this.data.round.current].time = this.data.round.array[this.data.round.current].duration.prepair;
      this.temp.roundPrepairTimeout = setTimeout(function() {
        var character, _i, _len, _ref, _results;
        _this.GameLogic_handleRoundFight();
        _ref = _this.characterArray;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          character = _ref[_i];
          _results.push(_this.GameManager.Server.IO.send(_this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID, {
            header: 'roundPrepairEnd'
          }));
        }
        return _results;
      }, this.data.round.array[this.data.round.current].duration.prepair);
      _ref = this.characterArray;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        _results.push(this.GameManager.Server.IO.send(this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID, {
          header: 'roundPrepair'
        }));
      }
      return _results;
    };

    CGameObject.prototype.GameLogic_handleRoundFight = function() {
      var character, _i, _len, _ref, _results,
        _this = this;
      console.log('GameLogic_handleRoundFight');
      this.handleRoundTimeStop();
      this.handleRoundTimeStart();
      this.handleCharacters_spawn();
      this.data.round.array[this.data.round.current].status = 'fight';
      this.data.round.array[this.data.round.current].time = this.data.round.array[this.data.round.current].duration.fight;
      this.temp.roundFightTimeout = setTimeout(function() {
        var alive, aliveArray, character, deadCharacter, _i, _j, _len, _len1, _ref, _ref1;
        _this.handleRoundTimeStop();
        if (_this.data.round.array[_this.data.round.current].status === 'fight') {
          aliveArray = [];
          _ref = _this.characterArray;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            character = _ref[_i];
            alive = true;
            _ref1 = _this.data.round.array[_this.data.round.current].deadArray;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              deadCharacter = _ref1[_j];
              if (deadCharacter.ClientID === character.ClientID) {
                alive = false;
              }
            }
            if (alive) {
              aliveArray.push(character);
            }
          }
          return _this.GameLogic_handleRoundEnd(aliveArray);
        }
      }, this.data.round.array[this.data.round.current].duration.fight);
      _ref = this.characterArray;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        _results.push(this.GameManager.Server.IO.send(this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID, {
          header: 'roundFight'
        }));
      }
      return _results;
    };

    CGameObject.prototype.GameLogic_handleRoundEnd = function(winnerArray) {
      var ClientID, character, i, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      console.log('GameLogic_handleRoundEnd');
      for (_i = 0, _len = winnerArray.length; _i < _len; _i++) {
        character = winnerArray[_i];
        value = this.data.round.array[this.data.round.current].deadArray.length;
        if (value === 0) {
          value = 1;
        }
        character.points += value;
      }
      _ref = this.data.round.array[this.data.round.current].deadArray;
      for (i = _j = 0, _len1 = _ref.length; _j < _len1; i = ++_j) {
        ClientID = _ref[i];
        character = this.getCharacterByClientID(ClientID);
        character.points += i;
      }
      this.data.round.array[this.data.round.current].status = 'end';
      _ref1 = this.characterArray;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        character = _ref1[_k];
        this.GameManager.Server.IO.send(this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID, {
          header: 'roundEnd'
        });
      }
      this.data.round.current++;
      return this.GameLogic_handleRound();
    };

    CGameObject.prototype.GameLogic_handleEnd = function() {
      var character, _i, _len, _ref;
      console.log('stopGame', this.id);
      this.status = 'end';
      _ref = this.characterArray;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        this.GameManager.Server.IO.send(this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID, {
          header: 'endGame',
          GameObject: this.getGameObject()
        });
      }
      clearInterval(this.GameLoopInterval);
      clearInterval(this.GameLoopTimeInterval);
      clearTimeout(this.temp.roundPrepairTimeout);
      clearTimeout(this.temp.roundFightTimeout);
      return this.GameManager.removeGame(this);
    };

    CGameObject.prototype.checkEnd = function() {
      var character, end, winner, _i, _len, _ref;
      console.log('checkEnd');
      winner = false;
      end = true;
      _ref = this.characterArray;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        if (!character.dead) {
          if (!winner) {
            winner = character;
          } else {
            end = false;
          }
        }
      }
      if (end) {
        return this.GameLogic_handleRoundEnd([winner]);
      }
    };

    CGameObject.prototype.handleAbilities = function(x) {
      var ability, abilityB, character, fired, i, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = this.abilitiesArray;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        ability = _ref[i];
        ability.model.state.time += x;
        if (ability.model.state.time > ability.model.state.duration) {
          ability.model.state.time = 0;
        }
        switch (ability.model.state.id) {
          case 'move':
            this.handleAbility_move(ability, x);
            fired = false;
            _ref1 = this.characterArray;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              character = _ref1[_j];
              if (character.ClientID !== ability.caster.ClientID) {
                if (common.collision_detect_ability(ability, character)) {
                  if (character.shield) {
                    common.handle.ability.rebound(ability, character);
                  } else {
                    ability.model.state = ability.model.states.fire;
                    fired = true;
                  }
                }
              }
            }
            if (!fired) {
              _results.push((function() {
                var _k, _len2, _ref2, _results1;
                _ref2 = this.abilitiesArray;
                _results1 = [];
                for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                  abilityB = _ref2[_k];
                  if (abilityB.uniqeID !== ability.uniqeID) {
                    if (common.collision_detect_ability(ability, abilityB)) {
                      _results1.push(ability.model.state = ability.model.states.fire);
                    } else {
                      _results1.push(void 0);
                    }
                  } else {
                    _results1.push(void 0);
                  }
                }
                return _results1;
              }).call(this));
            } else {
              _results.push(void 0);
            }
            break;
          case 'fire':
            _results.push(this.handleAbility_fire(ability));
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
    };

    CGameObject.prototype.handleAbility_move = function(ability, x) {
      var _this = this;
      common.handle.model.move(ability.model, ability.direction.vector, ability.velocity);
      if (!ability.moveTimeout) {
        ability.moveTimeout = true;
        return setTimeout(function() {
          if (ability.model.state.id !== 'fire') {
            return ability.model.state = ability.model.states.fire;
          }
        }, ability.duration.move);
      }
    };

    CGameObject.prototype.handleAbility_fire = function(ability) {
      var _this = this;
      if (!ability.fireTimeout) {
        ability.fireTimeout = true;
        ability.handler(this);
        if (ability.model.state.sound) {
          this.soundArray.push(ability.model.state.sound);
        }
        return setTimeout(function() {
          return common.array_remove(_this.abilitiesArray, ability);
        }, ability.duration.fire);
      }
    };

    CGameObject.prototype.handleCharacters = function(x) {
      var ability, character, characterB, cooldown, graphicEffect, move, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _results;
      _ref = this.characterArray;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        if (character) {
          character.model.state.time += x;
          if (character.model.state.time > character.model.state.duration) {
            character.model.state.time = 0;
          }
          _ref1 = character.cooldowns;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            cooldown = _ref1[_j];
            if (cooldown) {
              if (cooldown.value) {
                if (cooldown.value > 0) {
                  cooldown.value -= x;
                }
                if (cooldown.value < 0) {
                  cooldown.value = 0;
                }
              }
            }
          }
          _ref2 = character.graphicEffects;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            graphicEffect = _ref2[_k];
            graphicEffect.model.state.time += x;
            if (graphicEffect.model.state.time > graphicEffect.model.state.duration) {
              graphicEffect.model.state.time = 0;
            }
          }
          character.onwater.model.state.time += x;
          if (character.onwater.model.state.time > character.onwater.model.state.duration) {
            character.onwater.model.state.time = 0;
          }
          switch (character.model.state.id) {
            case 'move':
              move = true;
              if (common.collision_detect_walkZone(character, this.level)) {
                move = false;
              } else {
                _ref3 = this.characterArray;
                for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                  characterB = _ref3[_l];
                  if (characterB.ClientID !== character.ClientID) {
                    if (common.collision_detect_character(character, characterB)) {
                      move = false;
                    }
                  }
                }
              }
              if (move) {
                common.handle.model.move(character.model, character.direction.vector, character.velocity);
              }
              break;
            case 'ability':
              if (character.abilityID) {
                ability = Assets[character.abilityID]();
                ability.uniqeID = this.temp.uniqeAbilityIDCounter;
                this.temp.uniqeAbilityIDCounter++;
                ability.caster = character;
                character.cooldowns[character.cooldownID] = {
                  value: ability.cooldown,
                  time: ability.cooldown
                };
                if (ability.type !== 'effect') {
                  ability.castPoint = [ability.model.x, ability.model.y];
                  ability.direction = {
                    angle: character.direction.angle,
                    vector: [character.direction.vector[0], character.direction.vector[1]]
                  };
                  ability.model.x = character.model.x;
                  ability.model.y = character.model.y;
                  common.handle.model.move(ability.model, ability.direction.vector, character.model.radius);
                  this.abilitiesArray.push(ability);
                  if (ability.model.state.sound) {
                    this.soundArray.push(ability.model.state.sound);
                  }
                } else {
                  ability.handler(this);
                  if (ability.sound) {
                    this.soundArray.push(ability.sound);
                  }
                }
                character.abilityID = false;
              }
          }
          if (character.hp.current <= 0) {
            character.dead = true;
            this.data.round.array[this.data.round.current].deadArray.push(character.ClientID);
            _results.push(this.checkEnd());
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    CGameObject.prototype.handleCharacters_spawn = function() {
      var character, i, _i, _len, _ref, _results;
      _ref = this.characterArray;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        character = _ref[i];
        character.model.state = character.model.states.stand;
        character.hp.current = character.hp.max;
        character.dead = false;
        character.model.x = this.level.spawnLocations[i].x;
        _results.push(character.model.y = this.level.spawnLocations[i].y);
      }
      return _results;
    };

    CGameObject.prototype.handleLevel = function(x) {
      var character, _i, _len, _ref, _results;
      this.level.ground.state.time += x;
      if (this.level.ground.state.time > this.level.ground.state.duration) {
        this.level.ground.state.time = 0;
      }
      this.level.water.state.time += x;
      if (this.level.water.state.time > this.level.water.state.duration) {
        this.level.water.state.time = 0;
      }
      _ref = this.characterArray;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        if (!(Math.pow(character.model.x - this.level.safeZone.cx, 2) / Math.pow(this.level.safeZone.rx, 2) + Math.pow(character.model.y + character.model.radius - this.level.safeZone.cy, 2) / Math.pow(this.level.safeZone.ry, 2) <= 1)) {
          character.onwater.flag = true;
          _results.push(character.hp.current = character.hp.current - 25 * x / 1000);
        } else {
          _results.push(character.onwater.flag = false);
        }
      }
      return _results;
    };

    CGameObject.prototype.massDelivery = function() {
      var character, _i, _len, _ref;
      _ref = this.characterArray;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        character = _ref[_i];
        this.GameManager.Server.IO.send(this.GameManager.Server.ClientManager.ClientArray[character.ClientID].ClientSocketID, {
          header: 'massDelivery',
          GameObject: this.getGameObject()
        });
      }
      return this.soundArray = [];
    };

    return CGameObject;

  })();

  CRound = (function() {
    function CRound(options) {
      this.number = options.number;
      this.status = 'prepair';
      this.deadArray = [];
      this.time = 0;
      this.statistic = {};
      this.duration = {
        prepair: 10000,
        fight: 45000
      };
    }

    return CRound;

  })();

  module.exports = CGameObject;

}).call(this);
