(function() {
  var common;

  common = {
    math: {
      radToDeg: function(x) {
        return x * 180 / Math.PI;
      },
      degToRad: function(x) {
        return x * Math.PI / 180;
      },
      vector_angle: function(A, B) {
        var angle_cos, angle_rad;
        angle_cos = A[0] * B[0] + A[1] * B[1];
        angle_rad = Math.acos(angle_cos);
        return common.math.radToDeg(angle_rad);
      },
      vector_length: function(v) {
        return Math.pow(Math.pow(v[0], 2) + Math.pow(v[1], 2), 0.5);
      },
      vector_normalize: function(v) {
        return [v[0] / Math.pow(Math.pow(v[0], 2) + Math.pow(v[1], 2), 0.5), v[1] / Math.pow(Math.pow(v[0], 2) + Math.pow(v[1], 2), 0.5)];
      },
      vector_projection: function(A, B) {
        return A[0] * B[0] + A[1] * B[1];
      },
      vector_rotation: function(v, A) {
        var cosA, sinA, x_, y_;
        sinA = Math.sin(common.math.degToRad(A));
        cosA = Math.cos(common.math.degToRad(A));
        x_ = v[0] * cosA - v[1] * sinA;
        y_ = v[0] * sinA + v[1] * cosA;
        return [x_, y_];
      }
    },
    handle: {
      character: {
        effect: function(character, effect) {
          return common.array_add_chain(character.effects, effect, effect.data.duration);
        }
      },
      model: {
        move: function(model, vd, value) {
          model.x += value * vd[0];
          return model.y += value * vd[1];
        }
      },
      ability: {
        damage: function(options) {
          var resistK, value;
          switch (options.effect.data.type) {
            case 'magic':
              resistK = (100 - options.target.resist.magic) / 100;
              break;
            case 'pure':
              resistK = 1;
          }
          value = options.effect.data.value * resistK;
          if (options.target.immunity[options.effect.data.type]) {
            value = 0;
          } else {
            if (options.target.absorb[options.effect.data.type] >= value) {
              options.target.absorb[options.effect.data.type] -= value;
              value = 0;
            } else if (options.target.absorb[options.effect.data.type] > 0 && options.target.absorb[options.effect.data.type] < value) {
              options.target.absorb[options.effect.data.type] = 0;
              value -= options.target.absorb[options.effect.data.type];
            }
          }
          return options.target.hp.current -= value;
        },
        heal: function(options) {
          return common.deal_heal(options.target, options.effect.data.value);
        },
        DOT: function(options) {
          var DOT_interval, resistK, step, steps,
            _this = this;
          switch (options.effect.data.type) {
            case 'magic':
              resistK = (100 - options.target.resist.magic) / 100;
              break;
            case 'pure':
              resistK = 1;
          }
          step = 0;
          steps = options.effect.data.duration / options.effect.data.delay;
          DOT_interval = setInterval(function() {
            var value;
            value = options.effect.data.value * resistK / steps;
            if (options.target.immunity[options.effect.data.type]) {
              value = 0;
            } else {
              if (options.target.absorb[options.effect.data.type] >= value) {
                options.target.absorb[options.effect.data.type] -= value;
                value = 0;
              } else if (options.target.absorb[options.effect.data.type] > 0 && options.target.absorb[options.effect.data.type] < value) {
                options.target.absorb[options.effect.data.type] = 0;
                value -= options.target.absorb[options.effect.data.type];
              }
            }
            options.target.hp.current -= value;
            step++;
            if (step >= steps) {
              return clearInterval(DOT_interval);
            }
          }, options.effect.data.delay);
          return common.handle.character.effect(options.target, options.effect);
        },
        HOT: function(options) {
          var DOT_interval, step, steps,
            _this = this;
          step = 0;
          steps = options.effect.data.duration / options.effect.data.delay;
          DOT_interval = setInterval(function() {
            common.deal_heal(options.target, options.effect.data.value / steps);
            step++;
            if (step >= steps) {
              return clearInterval(DOT_interval);
            }
          }, options.effect.data.delay);
          return common.handle.character.effect(options.target, options.effect);
        },
        buff: function(options) {
          var k, v, _ref,
            _this = this;
          _ref = options.effect.value;
          for (k in _ref) {
            v = _ref[k];
            options.target[k] += v;
            setTimeout(function() {
              return options.target[k] -= v;
            }, options.effect.data.duration);
          }
          return common.handle.character.effect(options.target, options.effect);
        },
        debuff: function(options) {
          var k, v, _ref,
            _this = this;
          _ref = options.effect.value;
          for (k in _ref) {
            v = _ref[k];
            options.target[k] -= v;
            setTimeout(function() {
              return options.target[k] += v;
            }, options.effect.data.duration);
          }
          return common.handle.character.effect(options.target, options.effect);
        },
        effect: function(options) {
          var _this = this;
          options.target[options.effect.data.value] = true;
          setTimeout(function() {
            return options.target[options.effect.data.value] = false;
          }, options.effect.data.duration);
          return common.handle.character.effect(options.target, options.effect);
        },
        graphicEffect: function(options) {
          return common.array_add_chain(options.target.graphicEffects, {
            id: options.effect.data.id,
            type: options.effect.data.type,
            model: options.effect.data.model
          }, options.effect.data.duration);
        },
        knockback: function(options) {
          var knockback_interval, step, steps, vd,
            _this = this;
          if (options.ability.type === 'meele') {
            vd = options.caster.direction.vector;
          } else if (options.ability.type === 'range') {
            vd = common.math.vector_normalize([options.target.model.x - options.ability.model.x, options.target.model.y - options.ability.model.y]);
          }
          step = 0;
          steps = options.effect.data.duration / 20;
          knockback_interval = setInterval(function() {
            options.target.model.x += parseInt(vd[0] * options.effect.data.value / steps);
            options.target.model.y += parseInt(vd[1] * options.effect.data.value / steps);
            step++;
            if (step >= steps) {
              return clearInterval(knockback_interval);
            }
          }, 20);
          return common.handle.character.effect(options.target, options.effect);
        },
        absorb: function(options) {
          var _this = this;
          options.target.absorb[options.effect.data.type] += options.effect.data.value;
          setTimeout(function() {
            if (options.target.absorb[options.effect.data.type] >= options.effect.data.value) {
              return options.target.absorb[options.effect.data.type] -= options.effect.data.value;
            } else if (options.target.absorb[options.effect.data.type] > 0 && options.target.absorb[options.effect.data.type] < options.effect.data.value) {
              return options.target.absorb[options.effect.data.type] = 0;
            }
          }, options.effect.data.duration);
          return common.handle.character.effect(options.target, options.effect);
        },
        immunity: function(options) {
          var _this = this;
          options.target.immunity[options.effect.data.type] = true;
          setTimeout(function() {
            return options.target.immunity[options.effect.data.type] = false;
          }, options.effect.data.duration);
          return common.handle.character.effect(options.target, options.effect);
        },
        shield: function(options) {
          var _this = this;
          options.target.shield = true;
          setTimeout(function() {
            return options.target.shield = false;
          }, options.effect.data.duration);
          return common.handle.character.effect(options.target, options.effect);
        },
        rebound: function(ability, target) {
          var collisionPoint, fall_angle, fall_vector, newAngle, normal_vector, rebound_vector;
          collisionPoint = [ability.model.x + ability.model.radius * ability.direction.vector[0], ability.model.y + ability.model.radius * ability.direction.vector[1]];
          normal_vector = [ability.model.x - target.model.x, ability.model.y - target.model.y];
          fall_vector = [ability.castPoint[0] - ability.model.x, ability.castPoint[1] - ability.model.y];
          normal_vector = common.math.vector_normalize(normal_vector);
          fall_vector = common.math.vector_normalize(fall_vector);
          fall_angle = common.math.vector_angle(fall_vector, normal_vector);
          if (normal_vector[1] >= 0) {
            if (normal_vector[0] >= 0) {
              if (ability.castPoint[0] <= collisionPoint[0]) {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('II, left, top, -1');
                  fall_angle *= -1;
                } else {
                  console.log('II, left, bottom, -1');
                  fall_angle *= -1;
                }
              } else {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('II, right, top, 1');
                  fall_angle *= 1;
                } else {
                  console.log('II, right, bottom, 1');
                  fall_angle *= 1;
                }
              }
            } else {
              if (ability.castPoint[0] <= collisionPoint[0]) {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('III, left, top, -1');
                  fall_angle *= -1;
                } else {
                  console.log('III, left, bottom, -1');
                  fall_angle *= -1;
                }
              } else {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('III, right, top, 1');
                  fall_angle *= -1;
                } else {
                  console.log('III, right, bottom, 1');
                  fall_angle *= 1;
                }
              }
            }
          } else {
            if (normal_vector[0] >= 0) {
              if (ability.castPoint[0] <= collisionPoint[0]) {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('I, left, top, 1');
                  fall_angle *= 1;
                } else {
                  console.log('I, left, bottom, 1');
                  fall_angle *= 1;
                }
              } else {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('I, right, top, -1');
                  fall_angle *= -1;
                } else {
                  console.log('I, right, bottom, -1');
                  fall_angle *= -1;
                }
              }
            } else {
              if (ability.castPoint[0] <= collisionPoint[0]) {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('IV, left, top, 1');
                  fall_angle *= 1;
                } else {
                  console.log('IV, left, bottom, 1');
                  fall_angle *= 1;
                }
              } else {
                if (ability.castPoint[1] <= collisionPoint[1]) {
                  console.log('IV, right, top, -1');
                  fall_angle *= -1;
                } else {
                  console.log('IV, right, bottom, -1');
                  fall_angle *= -1;
                }
              }
            }
          }
          rebound_vector = common.math.vector_rotation(fall_vector, 2 * fall_angle);
          ability.direction.vector = rebound_vector;
          newAngle = common.math.vector_angle(ability.direction.vector, [1, 0]);
          if (ability.direction.vector[1] < 0) {
            newAngle = 360 - newAngle;
          }
          console.log(ability.direction.angle, newAngle);
          ability.direction.angle = newAngle;
          ability.caster = target;
          return ability.castPoint = collisionPoint;
        }
      }
    },
    array_add_chain: function(array, element, time) {
      array.push(element);
      return setTimeout(function() {
        return common.array_remove(array, element);
      }, time);
    },
    array_remove: function(array, element) {
      if (array.indexOf(element) >= 0) {
        return array.splice(array.indexOf(element), 1);
      }
    },
    collision_detect_safeZone: function(character, level) {},
    collision_detect_walkZone: function(character, level) {
      var x1, y1;
      x1 = character.model.x + character.velocity * character.direction.vector[0];
      y1 = character.model.y + character.velocity * character.direction.vector[1];
      if (x1 < level.walkZone[0][0] || x1 > level.walkZone[1][0] || y1 < level.walkZone[0][1] || y1 > level.walkZone[1][1]) {
        return true;
      } else {
        return false;
      }
    },
    collision_detect_ability: function(a, b) {
      var length, x1, x2, y1, y2;
      x1 = a.model.x + a.velocity * a.direction.vector[0];
      y1 = a.model.y + a.velocity * a.direction.vector[1];
      x2 = b.model.x;
      y2 = b.model.y;
      length = common.math.vector_length([x2 - x1, y2 - y1]);
      return length < (a.model.radius + b.model.radius);
    },
    collision_detect_character: function(a, b) {
      var k, length, x1, x2, y1, y2;
      x1 = a.model.x + a.velocity * a.direction.vector[0];
      y1 = a.model.y + a.velocity * a.direction.vector[1];
      k = 0;
      if (b.model.state.id === 'move') {
        k = 1;
      }
      x2 = b.model.x + a.velocity * a.direction.vector[0] * k;
      y2 = b.model.y + a.velocity * a.direction.vector[0] * k;
      length = common.math.vector_length([x2 - x1, y2 - y1]);
      return length < (a.model.radius + b.model.radius);
    },
    get_distance_between_objects: function(a, b) {
      var AB;
      AB = [a.model.x - b.model.x, a.model.y - b.model.y];
      return common.math.vector_length(AB);
    },
    deal_heal: function(target, value) {
      var hp_difference;
      hp_difference = target.hp.max - target.hp.current;
      if (value >= hp_difference) {
        return target.hp.current = target.hp.max;
      } else {
        return target.hp.current += value;
      }
    }
  };

  module.exports = common;

}).call(this);
