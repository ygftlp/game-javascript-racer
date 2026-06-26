(function(Racer) {
  var Assets = {
    packs: {
      legacy: {
        id: 'legacy',
        label: 'Original demo assets',
        commercialSafe: false,
        images: {
          background: 'images/background.png',
          sprites: 'images/sprites.png'
        },
        audio: {
          musicOgg: 'music/racer.ogg',
          musicMp3: 'music/racer.mp3'
        }
      },

      default: {
        id: 'default',
        label: 'Commercial replacement pack',
        commercialSafe: true,
        images: {
          background: 'assets/packs/default/images/background.png',
          sprites: 'assets/packs/default/images/sprites.png'
        },
        audio: {
          musicOgg: 'assets/packs/default/audio/music/racer.ogg',
          musicMp3: 'assets/packs/default/audio/music/racer.mp3'
        }
      }
    },

    currentPack: function() {
      var id = (Racer.Config.assets && Racer.Config.assets.activePack) || 'legacy';
      return Assets.packs[id] || Assets.packs.legacy;
    },

    imageSources: function() {
      var pack = Assets.currentPack();
      return [
        { id: 'background', src: pack.images.background },
        { id: 'sprites', src: pack.images.sprites }
      ];
    },

    applyAudioSources: function() {
      var pack = Assets.currentPack();
      var music = Dom.get('music');
      var sources;

      if (!music || !pack.audio)
        return;

      sources = music.getElementsByTagName('source');
      if (sources[0] && pack.audio.musicOgg)
        sources[0].src = pack.audio.musicOgg;
      if (sources[1] && pack.audio.musicMp3)
        sources[1].src = pack.audio.musicMp3;
      if (music.load)
        music.load();
    }
  };

  Racer.Assets = Assets;
})(Racer);
