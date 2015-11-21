(function() {
  var Assets, CAbility, CEffect, CLevel, CModel, CSound, CState, common;

  common = require('./common');

  CLevel = (function() {
    function CLevel(options) {
      this.id = options.id, this.width = options.width, this.height = options.height, this.safeZone = options.safeZone, this.walkZone = options.walkZone, this.spawnLocations = options.spawnLocations;
      this.ground = {
        state: {
          time: 0,
          duration: 1000
        }
      };
      this.water = {
        state: {
          time: 0,
          duration: 1000
        }
      };
    }

    return CLevel;

  })();

  CModel = (function() {
    function CModel(options) {
      this.id = options.id, this.state = options.state, this.states = options.states, this.radius = options.radius;
      this.x = 0;
      this.y = 0;
      this.state = this.states[this.state];
    }

    return CModel;

  })();

  CState = (function() {
    function CState(options) {
      this.id = options.id, this.duration = options.duration, this.index = options.index, this.state = options.state, this.sound = options.sound, this.flat = options.flat;
      this.time = 0;
    }

    return CState;

  })();

  CAbility = (function() {
    function CAbility(options) {
      this.id = options.id, this.cooldown = options.cooldown, this.duration = options.duration, this.delay = options.delay, this.range = options.range, this.velocity = options.velocity, this.radius = options.radius, this.model = options.model, this.effects = options.effects, this.handler = options.handler;
      if (this.duration) {
        if (this.duration.move) {
          this.type = 'range';
        } else {
          this.type = 'meele';
        }
      } else {
        this.type = 'effect';
        this.sound = options.sound;
      }
    }

    return CAbility;

  })();

  CEffect = (function() {
    function CEffect(options) {
      this.type = options.type, this.target = options.target, this.data = options.data;
    }

    return CEffect;

  })();

  CSound = (function() {
    function CSound(options) {
      this.id = options.id;
    }

    return CSound;

  })();

  Assets = {
    level0: function() {
      return new CLevel({
        id: 'level0',
        width: 3000,
        height: 3000,
        walkZone: [[500, 500], [2500, 2500]],
        safeZone: {
          cx: 1500,
          cy: 1500,
          rx: 600,
          ry: 300
        },
        spawnLocations: [
          {
            x: 1400,
            y: 1400
          }, {
            x: 1500,
            y: 1600
          }, {
            x: 1600,
            y: 1400
          }
        ]
      });
    },
    water_GraphicEffect: function() {
      return new CModel({
        id: 'water_GraphicEffect',
        radius: 50,
        state: 'state1',
        states: {
          state1: new CState({
            id: 'state1',
            index: 0,
            duration: 1000
          })
        }
      });
    },
    modelA: function() {
      return new CModel({
        id: 'modelA',
        radius: 50,
        state: 'stand',
        states: {
          stand: new CState({
            id: 'stand',
            index: 0,
            duration: 1000
          }),
          move: new CState({
            id: 'move',
            index: 1,
            duration: 500
          }),
          ability: new CState({
            id: 'ability',
            index: 2,
            duration: 500
          })
        }
      });
    },
    modelB: function() {
      return new CModel({
        id: 'modelB',
        radius: 50,
        state: 'stand',
        states: {
          stand: new CState({
            id: 'stand',
            index: 0,
            duration: 1000
          }),
          move: new CState({
            id: 'move',
            index: 1,
            duration: 500
          }),
          ability: new CState({
            id: 'ability',
            index: 2,
            duration: 500
          })
        }
      });
    },
    twirl: function() {
      return new CAbility({
        id: 'twirl',
        delay: 0,
        cooldown: 2000,
        duration: {
          fire: 500
        },
        range: 150,
        radius: 75,
        model: new CModel({
          id: 'twirl',
          radius: 75,
          flat: true,
          state: 'fire',
          states: {
            fire: new CState({
              id: 'fire',
              index: 0,
              duration: 1000,
              sound: new CSound({
                id: 'ability_twirl_fire'
              })
            })
          }
        }),
        effects: [
          new CEffect({
            type: 'HOT',
            target: 'caster',
            data: {
              value: 5,
              delay: 50,
              duration: 1000
            }
          }), new CEffect({
            type: 'damage',
            target: 'target',
            data: {
              type: 'pure',
              value: 25
            }
          }), new CEffect({
            type: 'knockback',
            target: 'target',
            data: {
              value: 50,
              duration: 250
            }
          })
        ],
        handler: function(GameObject) {
          var angle, distance, effect, target, _i, _j, _len, _len1, _ref, _ref1, _results;
          console.log('twirl handler');
          _ref = this.effects;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            effect = _ref[_i];
            effect.abilityID = this.id;
            if (effect.target === 'caster') {
              common.handle.ability[effect.type]({
                abilityID: this.id,
                caster: this.caster,
                target: this.caster,
                effect: effect
              });
            }
          }
          _ref1 = GameObject.characterArray;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            target = _ref1[_j];
            if (this.caster.ClientID !== target.ClientID) {
              angle = common.math.vector_angle(common.math.vector_normalize([target.model.x - this.model.x, target.model.y - this.model.y]), this.direction.vector);
              distance = common.get_distance_between_objects(this, target);
              if (distance <= this.range && angle <= this.radius) {
                _results.push((function() {
                  var _k, _len2, _ref2, _results1;
                  _ref2 = this.effects;
                  _results1 = [];
                  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                    effect = _ref2[_k];
                    effect.abilityID = this.id;
                    if (effect.target === 'target') {
                      _results1.push(common.handle.ability[effect.type]({
                        ability: this,
                        caster: this.caster,
                        target: target,
                        effect: effect
                      }));
                    } else {
                      _results1.push(void 0);
                    }
                  }
                  return _results1;
                }).call(this));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      });
    },
    firebolt: function() {
      return new CAbility({
        id: 'firebolt',
        delay: 0,
        cooldown: 1000,
        duration: {
          move: 1500,
          fire: 500
        },
        velocity: 5,
        range: 125,
        model: new CModel({
          id: 'firebolt',
          radius: 50,
          state: 'move',
          states: {
            move: new CState({
              id: 'move',
              index: 0,
              duration: 500,
              sound: new CSound({
                id: 'ability_firebolt_move'
              })
            }),
            fire: new CState({
              id: 'fire',
              flat: true,
              index: 1,
              duration: 500,
              sound: new CSound({
                id: 'ability_firebolt_fire'
              })
            })
          }
        }),
        effects: [
          new CEffect({
            type: 'damage',
            target: 'target',
            data: {
              type: 'magic',
              value: 10
            }
          }), new CEffect({
            type: 'DOT',
            target: 'target',
            data: {
              type: 'magic',
              value: 10,
              delay: 100,
              duration: 1000
            }
          }), new CEffect({
            type: 'knockback',
            target: 'target',
            data: {
              value: 50,
              duration: 250
            }
          }), new CEffect({
            type: 'graphicEffect',
            target: 'target',
            data: {
              id: 'firebolt_GraphicEffect',
              type: 'front',
              model: new CModel({
                id: 'firebolt_GraphicEffect',
                radius: 50,
                state: 'state1',
                states: {
                  state1: new CState({
                    id: 'state1',
                    index: 0,
                    duration: 250
                  })
                }
              }),
              duration: 1000
            }
          })
        ],
        handler: function(GameObject) {
          var angle, distance, effect, target, _i, _j, _len, _len1, _ref, _ref1, _results;
          console.log('firebolt handler');
          _ref = this.effects;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            effect = _ref[_i];
            effect.abilityID = this.id;
            if (effect.target === 'caster') {
              common.handle.ability[effect.type]({
                abilityID: this.id,
                caster: this.caster,
                target: this.caster,
                effect: effect
              });
            }
          }
          _ref1 = GameObject.characterArray;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            target = _ref1[_j];
            if (this.caster.ClientID !== target.ClientID) {
              angle = common.math.vector_angle(common.math.vector_normalize([target.model.x - this.model.x, target.model.y - this.model.y]), this.direction.vector);
              distance = common.get_distance_between_objects(this, target);
              if (distance <= this.range) {
                _results.push((function() {
                  var _k, _len2, _ref2, _results1;
                  _ref2 = this.effects;
                  _results1 = [];
                  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                    effect = _ref2[_k];
                    effect.abilityID = this.id;
                    if (effect.target === 'target') {
                      _results1.push(common.handle.ability[effect.type]({
                        ability: this,
                        caster: this.caster,
                        target: target,
                        effect: effect
                      }));
                    } else {
                      _results1.push(void 0);
                    }
                  }
                  return _results1;
                }).call(this));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      });
    },
    fadebolt: function() {
      return new CAbility({
        id: 'fadebolt',
        delay: 0,
        cooldown: 1000,
        duration: {
          move: 1500,
          fire: 500
        },
        velocity: 5,
        range: 125,
        model: new CModel({
          id: 'fadebolt',
          radius: 50,
          state: 'move',
          states: {
            move: new CState({
              id: 'move',
              index: 0,
              duration: 500,
              sound: new CSound({
                id: 'ability_fadebolt_move'
              })
            }),
            fire: new CState({
              id: 'fire',
              flat: true,
              index: 1,
              duration: 500,
              sound: new CSound({
                id: 'ability_fadebolt_fire'
              })
            })
          }
        }),
        effects: [
          new CEffect({
            type: 'damage',
            target: 'target',
            data: {
              type: 'magic',
              value: 15
            }
          }), new CEffect({
            type: 'knockback',
            target: 'target',
            data: {
              value: 50,
              duration: 250
            }
          })
        ],
        handler: function(GameObject) {
          var angle, distance, effect, target, _i, _j, _len, _len1, _ref, _ref1, _results;
          console.log('fadebolt handler');
          _ref = this.effects;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            effect = _ref[_i];
            effect.abilityID = this.id;
            if (effect.target === 'caster') {
              common.handle.ability[effect.type]({
                abilityID: this.id,
                caster: this.caster,
                target: this.caster,
                effect: effect
              });
            }
          }
          _ref1 = GameObject.characterArray;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            target = _ref1[_j];
            if (this.caster.ClientID !== target.ClientID) {
              angle = common.math.vector_angle(common.math.vector_normalize([target.model.x - this.model.x, target.model.y - this.model.y]), this.direction.vector);
              distance = common.get_distance_between_objects(this, target);
              if (distance <= this.range) {
                _results.push((function() {
                  var _k, _len2, _ref2, _results1;
                  _ref2 = this.effects;
                  _results1 = [];
                  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                    effect = _ref2[_k];
                    effect.abilityID = this.id;
                    if (effect.target === 'target') {
                      _results1.push(common.handle.ability[effect.type]({
                        ability: this,
                        caster: this.caster,
                        target: target,
                        effect: effect
                      }));
                    } else {
                      _results1.push(void 0);
                    }
                  }
                  return _results1;
                }).call(this));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      });
    },
    shield: function() {
      return new CAbility({
        id: 'shield',
        delay: 0,
        cooldown: 10000,
        sound: new CSound({
          id: 'ability_shield'
        }),
        effects: [
          new CEffect({
            type: 'shield',
            target: 'caster',
            data: {
              duration: 5000
            }
          }), new CEffect({
            type: 'graphicEffect',
            target: 'caster',
            data: {
              id: 'shield_GraphicEffect',
              type: 'front',
              model: new CModel({
                id: 'shield_GraphicEffect',
                radius: 50,
                state: 'state1',
                states: {
                  state1: new CState({
                    id: 'state1',
                    index: 0,
                    duration: 1000
                  })
                }
              }),
              duration: 5000
            }
          })
        ],
        handler: function(GameObject) {
          var effect, _i, _len, _ref, _results;
          console.log('shield handler');
          _ref = this.effects;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            effect = _ref[_i];
            effect.abilityID = this.id;
            if (effect.target === 'caster') {
              _results.push(common.handle.ability[effect.type]({
                abilityID: this.id,
                caster: this.caster,
                target: this.caster,
                effect: effect
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      });
    },
    shadows: function() {
      return new CAbility({
        id: 'shadows',
        delay: 0,
        cooldown: 10000,
        sound: new CSound({
          id: 'ability_shadows'
        }),
        effects: [
          new CEffect({
            type: 'effect',
            target: 'caster',
            data: {
              value: 'invisibility',
              duration: 5000
            }
          })
        ],
        handler: function(GameObject) {
          var effect, _i, _len, _ref, _results;
          console.log('shadows handler');
          _ref = this.effects;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            effect = _ref[_i];
            effect.abilityID = this.id;
            if (effect.target === 'caster') {
              _results.push(common.handle.ability[effect.type]({
                abilityID: this.id,
                caster: this.caster,
                target: this.caster,
                effect: effect
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      });
    }
  };

  module.exports = Assets;

  '\n\nskill1: ->\n		return new CAbility\n			id: \'skill1\'\n			delay: 0\n			cooldown: 2\n			duration: \n				fire: 500\n			range: 150\n			radius: 45\n			model: new CModel\n				id: \'skill1\'\n				radius: 50\n				flat: true\n				state: \'fire\'\n				states:\n					fire: new CState\n						id: \'fire\'\n						index: 0\n						duration: 1000\n						sound: new CSound\n							id: \'skill1_fire\'\n			effects: [\n				new CEffect\n					type: \'damage\'\n					target: \'caster\'\n					data:\n						type: \'pure\'\n						value: 50\n				new CEffect\n					type: \'heal\'\n					target: \'caster\'\n					data:\n						value: 50\n				new CEffect\n					type: \'damage\'\n					target: \'target\'\n					data:\n						type: \'pure\'\n						value: 50\n				new CEffect\n					type: \'heal\'\n					target: \'target\'\n					data:\n						value: 50\n				new CEffect\n					type: \'DOT\'\n					target: \'caster\'\n					data:\n						type: \'magic\'\n						value: 50\n						delay: 100\n						duration: 1000\n				new CEffect\n					type: \'HOT\'\n					target: \'caster\'\n					data:\n						value: 37.5\n						delay: 50\n						duration: 1000\n				new CEffect\n					type: \'DOT\'\n					target: \'target\'\n					data:\n						type: \'magic\'\n						value: 50\n						delay: 100\n						duration: 1000\n				new CEffect\n					type: \'HOT\'\n					target: \'target\'\n					data:\n						value: 37.5\n						delay: 50\n						duration: 1000\n				new CEffect\n					type: \'buff\'\n					target: \'caster\'\n					data:\n						value:\n							hp: 100\n						duration: 1000\n				new CEffect\n					type: \'buff\'\n					target: \'target\'\n					data:\n						value:\n							hp: 100\n						duration: 1000\n				new CEffect\n					type: \'debuff\'\n					target: \'caster\'\n					data:\n						value:\n							hp: 100\n						duration: 1000\n				new CEffect\n					type: \'debuff\'\n					target: \'target\'\n					data:\n						value:\n							hp: 100\n						duration: 1000\n				new CEffect\n					type: \'effect\'\n					target: \'caster\'\n					data:\n						value: \'stun\'\n						duration: 1000\n				new CEffect\n					type: \'effect\'\n					target: \'target\'\n					data:\n						value: \'silence\'\n						duration: 1000\n				new CEffect\n					type: \'effect\'\n					target: \'caster\'\n					data:\n						value: \'root\'\n						duration: 2000\n				new CEffect\n					type: \'absorb\'\n					target: \'caster\'\n					data:\n						type: \'magic\'\n						value: 50\n						duration: 3000\n				new CEffect\n					type: \'immunity\'\n					target: \'caster\'\n					data:\n						type: \'magic\'\n						duration: 1500\n				new CEffect\n					type: \'shield\'\n					target: \'caster\'\n					data:\n						duration: 10000\n				new CEffect\n					type: \'effect\'\n					target: \'caster\'\n					data:\n						value: \'invisibility\'\n						duration: 5000\n				new CEffect\n					type: \'graphicEffect\'\n					target: \'caster\'\n					data:\n						id: \'skill1GraphicEffect\'\n						type: \'front\'\n						model: new CModel\n							id: \'front\'\n							radius: 75\n							state: \'fire\'\n							states:\n								fire: new CState\n									id: \'fire\'\n									index: 0\n									duration: 500\n						duration: 1000\n				new CEffect\n					type: \'graphicEffect\'\n					target: \'caster\'\n					data:\n						type: \'double\'\n						model: new CModel\n							id: \'front\'\n							radius: 100\n							state: \'fire\'\n							states:\n								fire: new CState\n									id: \'fire\'\n									index: 0\n									duration: 500\n						duration: 2000\n				new CEffect\n					type: \'knockback\'\n					target: \'target\'\n					data:\n						value: 50\n						duration: 500\n				]\n			handler: (GameObject) ->\n				console.log \'skill1 handler\'\n				for effect in @effects\n					if effect.target is \'caster\'			#for caster\n						common.handle.ability[effect.type]\n							abilityID: @id\n							caster: @caster\n							target: @caster\n							effect: effect\n\n				for target in GameObject.characterArray\n					if @caster.ClientID isnt target.ClientID\n						angle = common.math.vector_angle common.math.vector_normalize([target.model.x-@model.x, target.model.y-@model.y]), @direction.vector\n						distance = common.get_distance_between_objects(@, target)\n						if distance <= @range and angle <= @radius\n							for effect in @effects\n								if effect.target is \'target\'\n									common.handle.ability[effect.type]\n										ability: @\n										caster: @caster\n										target: target\n										effect: effect\n\n';

}).call(this);
