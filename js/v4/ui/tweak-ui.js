(function(Racer) {
  var TweakUI = {
    bind: function(onReset) {
      Dom.on('resolution', 'change', function(ev) {
        var key = ev.target.options[ev.target.selectedIndex].value;
        var size = Racer.Config.resolutions[key];
        if (size)
          onReset({ width: size.width, height: size.height });
        Dom.blur(ev);
      });

      Dom.on('lanes',        'change', function(ev) { Dom.blur(ev); onReset({ lanes:        ev.target.options[ev.target.selectedIndex].value }); });
      Dom.on('roadWidth',    'change', function(ev) { Dom.blur(ev); onReset({ roadWidth:    TweakUI.rangeValue(ev.target) }); });
      Dom.on('cameraHeight', 'change', function(ev) { Dom.blur(ev); onReset({ cameraHeight: TweakUI.rangeValue(ev.target) }); });
      Dom.on('drawDistance', 'change', function(ev) { Dom.blur(ev); onReset({ drawDistance: TweakUI.rangeValue(ev.target) }); });
      Dom.on('fieldOfView',  'change', function(ev) { Dom.blur(ev); onReset({ fieldOfView:  TweakUI.rangeValue(ev.target) }); });
      Dom.on('fogDensity',   'change', function(ev) { Dom.blur(ev); onReset({ fogDensity:   TweakUI.rangeValue(ev.target) }); });
    },

    rangeValue: function(input) {
      return Util.limit(
        Util.toInt(input.value),
        Util.toInt(input.getAttribute('min')),
        Util.toInt(input.getAttribute('max'))
      );
    },

    refresh: function() {
      var s = Racer.State;
      Dom.get('lanes').selectedIndex = s.lanes - 1;
      Dom.get('currentRoadWidth').innerHTML = Dom.get('roadWidth').value = s.roadWidth;
      Dom.get('currentCameraHeight').innerHTML = Dom.get('cameraHeight').value = s.cameraHeight;
      Dom.get('currentDrawDistance').innerHTML = Dom.get('drawDistance').value = s.drawDistance;
      Dom.get('currentFieldOfView').innerHTML = Dom.get('fieldOfView').value = s.fieldOfView;
      Dom.get('currentFogDensity').innerHTML = Dom.get('fogDensity').value = s.fogDensity;
    }
  };

  Racer.TweakUI = TweakUI;
})(Racer);
