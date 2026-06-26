(function(Racer, window) {
  var Platform = {
    provider: 'standalone',
    embedded: false,

    init: function() {
      var config = Racer.Config.platform || {};
      Platform.provider = config.provider || 'standalone';
      Platform.embedded = Platform.detectEmbedded();
      return Platform;
    },

    detectEmbedded: function() {
      try {
        return window.self !== window.top;
      }
      catch (e) {
        return true;
      }
    },

    isPortalBuild: function() {
      return Platform.provider !== 'standalone';
    },

    gameReady: function() {
      // Hook for portal SDKs, app wrappers, or iframe hosts.
      // Keep no-op by default so standalone browser play remains unchanged.
    },

    gameplayStart: function() {
      // Hook for future portal SDK gameplay-start events.
    },

    gameplayStop: function() {
      // Hook for future portal SDK gameplay-stop events.
    }
  };

  Racer.Platform = Platform;
})(Racer, window);
