(function(Racer, window) {
  var Analytics = {
    init: function() {
      Analytics.config = Racer.Config.analytics || {};
    },

    enabled: function() {
      return !!(Analytics.config && Analytics.config.enabled && Analytics.config.provider && Analytics.config.provider !== 'none');
    },

    track: function(eventName, data) {
      if (!Analytics.enabled())
        return;

      data = data || {};

      if (Analytics.config.provider === 'console' && window.console && window.console.log)
        window.console.log('[analytics]', eventName, data);

      // Future integration point for portal analytics, GA, Plausible, PostHog, etc.
    }
  };

  Racer.Analytics = Analytics;
})(Racer, window);
