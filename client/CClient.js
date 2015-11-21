(function() {
  var CClient;

  CClient = (function() {
    function CClient(options) {
      this.ClientManager = options.ClientManager, this.GameManager = options.GameManager, this.InputController = options.InputController, this.UI = options.UI, this.GraphicEngine = options.GraphicEngine, this.IO = options.IO;
      this.ClientManager.Client = this;
      this.GameManager.Client = this;
      this.InputController.Client = this;
      this.UI.Client = this;
      this.GraphicEngine.Client = this;
      this.IO.Client = this;
      this.AssetManager = {
        AbilitiesArray: ['firebolt', 'fadebolt', 'twirl', 'shield', 'shadows'],
        SpriteArray: {
          modelA_preview: new CSprite({
            id: 'character_rubick_preview',
            states: 1,
            directions: 1,
            frames: 24,
            rows: 1,
            src: 'assets/model/character_rubick_preview.png'
          }),
          modelB_preview: new CSprite({
            id: 'character_invoke_preview',
            states: 1,
            directions: 1,
            frames: 24,
            rows: 1,
            src: 'assets/model/character_invoke_preview.png'
          }),
          modelA: new CSprite({
            id: 'modelA',
            states: 3,
            directions: 9,
            frames: 24,
            rows: 27,
            src: 'assets/model/character_rubick.png'
          }),
          modelB: new CSprite({
            id: 'modelB',
            states: 3,
            directions: 9,
            frames: 24,
            rows: 27,
            src: 'assets/model/character_invoke.png'
          }),
          twirl: new CSprite({
            id: 'twirl',
            states: 1,
            directions: 1,
            frames: 48,
            rows: 1,
            src: 'assets/model/twirl.png'
          }),
          firebolt: new CSprite({
            id: 'firebolt',
            states: 2,
            directions: 9,
            frames: 25,
            rows: 10,
            src: 'assets/model/firebolt.png'
          }),
          firebolt_GraphicEffect: new CSprite({
            id: 'firebolt_GraphicEffect',
            states: 1,
            directions: 1,
            frames: 12,
            rows: 1,
            src: 'assets/model/firebolt_GraphicEffect.png'
          }),
          fadebolt: new CSprite({
            id: 'fadebolt',
            states: 2,
            directions: 9,
            frames: 22,
            rows: 10,
            src: 'assets/model/fadebolt.png'
          }),
          shield_GraphicEffect: new CSprite({
            id: 'shield_GraphicEffect',
            states: 1,
            directions: 1,
            frames: 25,
            rows: 1,
            src: 'assets/model/shield_GraphicEffect.png'
          }),
          level0_ground: new CSprite({
            id: 'level0_ground',
            states: 1,
            directions: 1,
            frames: 1,
            rows: 1,
            src: 'assets/model/level0_ground.png'
          }),
          level0_water: new CSprite({
            id: 'level0_water',
            states: 1,
            directions: 1,
            frames: 24,
            rows: 1,
            src: 'assets/model/level0_water.png'
          }),
          water_GraphicEffect: new CSprite({
            id: 'water_GraphicEffect',
            states: 1,
            directions: 1,
            frames: 24,
            rows: 1,
            src: 'assets/model/water_GraphicEffect.png'
          }),
          hpAnimation: new CSprite({
            id: 'hpAnimation',
            states: 1,
            directions: 1,
            frames: 109,
            rows: 1,
            src: 'assets/ui/hp_animation.png'
          })
        }
      };
      this.SoundEngine = {
        soundArray: [],
        trackArray: [],
        handle: function() {
          var sound, soundWrapper, track, _i, _len, _ref;
          soundWrapper = document.getElementById('soundWrapper');
          _ref = this.soundArray;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            sound = _ref[_i];
            track = document.createElement('audio');
            track.src = 'Assets/sound/' + sound.id + '.mp3';
            soundWrapper.appendChild(track);
            track.play();
            track.addEventListener('ended', function() {
              return this.parentNode.removeChild(this);
            });
          }
          return this.soundArray = [];
        }
      };
    }

    return CClient;

  })();

  window.CClient = CClient;

}).call(this);
