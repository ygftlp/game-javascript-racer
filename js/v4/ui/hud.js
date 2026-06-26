(function(Racer) {
  var Hud = {
    init: function() {
      var state = Racer.State;
      state.hud = {
        speed:            { value: null, dom: Dom.get('speed_value') },
        current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
        last_lap_time:    { value: null, dom: Dom.get('last_lap_time_value') },
        fast_lap_time:    { value: null, dom: Dom.get('fast_lap_time_value') }
      };
    },

    update: function(key, value) {
      var hud = Racer.State.hud[key];
      if (hud && (hud.value !== value)) {
        hud.value = value;
        Dom.set(hud.dom, value);
      }
    },

    formatTime: function(dt) {
      var minutes = Math.floor(dt / 60);
      var seconds = Math.floor(dt - (minutes * 60));
      var tenths = Math.floor(10 * (dt - Math.floor(dt)));
      if (minutes > 0)
        return minutes + "." + (seconds < 10 ? "0" : "") + seconds + "." + tenths;
      else
        return seconds + "." + tenths;
    }
  };

  Racer.Hud = Hud;
})(Racer);
