(function(Racer) {
  var BackgroundMap = {
    packs: {
      legacy: {
        HILLS: { x:   5, y:   5, w: 1280, h: 480 },
        SKY:   { x:   5, y: 495, w: 1280, h: 480 },
        TREES: { x:   5, y: 985, w: 1280, h: 480 }
      },

      default: {
        HILLS: { x:   5, y:   5, w: 1280, h: 480 },
        SKY:   { x:   5, y: 495, w: 1280, h: 480 },
        TREES: { x:   5, y: 985, w: 1280, h: 480 }
      }
    },

    current: function() {
      var id = (Racer.Config.assets && Racer.Config.assets.activePack) || 'legacy';
      return BackgroundMap.packs[id] || BackgroundMap.packs.legacy;
    },

    apply: function() {
      BACKGROUND = BackgroundMap.current();
    }
  };

  Racer.BackgroundMap = BackgroundMap;
})(Racer);
