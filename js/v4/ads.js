(function(Racer) {
  var Ads = {
    init: function() {
      Ads.config = Racer.Config.monetization || {};
    },

    enabled: function() {
      return !!(Ads.config && Ads.config.adsEnabled && Ads.config.provider && Ads.config.provider !== 'none');
    },

    showInterstitial: function(placement, done) {
      Ads.show('interstitial', placement, done);
    },

    showRewarded: function(placement, done) {
      Ads.show('rewarded', placement, done);
    },

    show: function(type, placement, done) {
      if (!Ads.enabled()) {
        Ads.finish(done, false);
        return;
      }

      // Future SDK integration point. Keep disabled by default so gameplay is not interrupted.
      Racer.Analytics.track('ad_requested', {
        type: type,
        placement: placement,
        provider: Ads.config.provider
      });
      Ads.finish(done, false);
    },

    finish: function(done, completed) {
      if (done)
        done(completed);
    }
  };

  Racer.Ads = Ads;
})(Racer);
