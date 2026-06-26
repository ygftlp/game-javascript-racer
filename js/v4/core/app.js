(function(Racer) {
  var App = {
    initialized: false,

    init: function() {
      if (App.initialized)
        return;

      Racer.BackgroundMap.apply();
      Racer.SpriteMap.apply();
      Racer.Platform.init();
      Racer.Analytics.init();
      Racer.Ads.init();
      Racer.Save.init();
      Racer.Assets.applyAudioSources();

      App.initialized = true;
      App.track('app_init', App.context());
    },

    context: function(extra) {
      var data = {
        product: Racer.Config.product.id,
        version: Racer.Config.product.version,
        platform: Racer.Platform.provider,
        embedded: Racer.Platform.embedded,
        assetPack: Racer.Assets.currentPack().id
      };
      var key;

      extra = extra || {};
      for (key in extra)
        if (extra.hasOwnProperty(key))
          data[key] = extra[key];

      return data;
    },

    assetsReady: function() {
      App.track('assets_ready', App.context());
    },

    gameReady: function() {
      Racer.Platform.gameReady();
      Racer.Platform.gameplayStart();
      App.track('game_ready', App.context());
    },

    collision: function(type) {
      App.track('collision', App.context({ type: type }));
    },

    lapComplete: function(lapTime, bestLapTime) {
      App.track('lap_complete', App.context({
        lapTime: lapTime,
        bestLapTime: bestLapTime
      }));
    },

    newFastLap: function(lapTime) {
      App.track('new_fast_lap', App.context({ lapTime: lapTime }));
    },

    showInterstitial: function(placement, done) {
      Racer.Ads.showInterstitial(placement, done);
    },

    showRewarded: function(placement, done) {
      Racer.Ads.showRewarded(placement, done);
    },

    track: function(eventName, data) {
      Racer.Analytics.track(eventName, data);
    }
  };

  Racer.App = App;
})(Racer);
