(function(Racer) {
  var Input = {
    keyBindings: function() {
      var input = Racer.State.input;
      var controls = Racer.Config.controls;

      return [
        { keys: controls.left,   mode: 'down', action: function() { input.left = true; } },
        { keys: controls.right,  mode: 'down', action: function() { input.right = true; } },
        { keys: controls.faster, mode: 'down', action: function() { input.faster = true; } },
        { keys: controls.slower, mode: 'down', action: function() { input.slower = true; } },
        { keys: controls.left,   mode: 'up',   action: function() { input.left = false; } },
        { keys: controls.right,  mode: 'up',   action: function() { input.right = false; } },
        { keys: controls.faster, mode: 'up',   action: function() { input.faster = false; } },
        { keys: controls.slower, mode: 'up',   action: function() { input.slower = false; } }
      ];
    }
  };

  Racer.Input = Input;
})(Racer);
