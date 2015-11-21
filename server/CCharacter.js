(function() {
  var Assets, CCharacter;

  Assets = require('./Assets');

  CCharacter = (function() {
    function CCharacter(options) {
      this.ClientID = options.ClientID, this.model = options.model;
      this.abilities = [];
      this.cooldowns = [];
      this.dead = false;
      this.velocity = 2;
      this.points = 0;
      this.direction = {
        vector: [1, 0],
        angle: 0
      };
      this.hp = {
        current: 100,
        max: 100
      };
      this.resist = {
        magic: 25
      };
      this.absorb = {
        magic: 0
      };
      this.immunity = {
        magic: false
      };
      this.shield = false;
      this.onwater = {
        flag: false,
        model: Assets.water_GraphicEffect()
      };
      this.effects = [];
      this.graphicEffects = [];
      this.combatText = {
        damage: []
      };
    }

    return CCharacter;

  })();

  module.exports = CCharacter;

}).call(this);
