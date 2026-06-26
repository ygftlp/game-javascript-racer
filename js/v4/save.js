(function(Racer, window) {
  var Save = {
    init: function() {
      Save.config = Racer.Config.storage || {};
    },

    key: function(name) {
      var namespace = Save.config.namespace || 'racer.v4';
      return namespace + '.' + name;
    },

    available: function() {
      return !!(Save.config && Save.config.enabled && window.localStorage);
    },

    get: function(name, fallback) {
      var value = null;

      if (Save.available())
        value = window.localStorage.getItem(Save.key(name));
      else if (Dom.storage)
        value = Dom.storage[name];

      return (value === null || typeof value === 'undefined') ? fallback : value;
    },

    set: function(name, value) {
      if (Save.available())
        window.localStorage.setItem(Save.key(name), value);
      else if (Dom.storage)
        Dom.storage[name] = value;
    },

    getFastLapTime: function() {
      var key = Save.config.fastLapKey || 'fast_lap_time';
      return Util.toFloat(Save.get(key, Racer.Config.defaultFastLapTime));
    },

    setFastLapTime: function(value) {
      var key = Save.config.fastLapKey || 'fast_lap_time';
      Save.set(key, value);
    }
  };

  Racer.Save = Save;
})(Racer, window);
