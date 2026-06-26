(function(Racer) {
  var GameController = {
    update: function(dt) {
      var s = Racer.State;
      var n;
      var car;
      var carW;
      var sprite;
      var spriteW;
      var playerSegment = Racer.Track.findSegment(s.position + s.playerZ);
      var playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
      var speedPercent = s.speed / s.maxSpeed;
      var dx = dt * 2 * speedPercent;
      var startPosition = s.position;

      Racer.Traffic.updateCars(dt, playerSegment, playerW);

      s.position = Util.increase(s.position, dt * s.speed, s.trackLength);

      if (s.input.left)
        s.playerX = s.playerX - dx;
      else if (s.input.right)
        s.playerX = s.playerX + dx;

      s.playerX = s.playerX - (dx * speedPercent * playerSegment.curve * s.centrifugal);

      if (s.input.faster)
        s.speed = Util.accelerate(s.speed, s.accel, dt);
      else if (s.input.slower)
        s.speed = Util.accelerate(s.speed, s.breaking, dt);
      else
        s.speed = Util.accelerate(s.speed, s.decel, dt);

      if ((s.playerX < -1) || (s.playerX > 1)) {
        if (s.speed > s.offRoadLimit)
          s.speed = Util.accelerate(s.speed, s.offRoadDecel, dt);

        for (n = 0; n < playerSegment.sprites.length; n++) {
          sprite = playerSegment.sprites[n];
          spriteW = sprite.source.w * SPRITES.SCALE;
          if (Util.overlap(s.playerX, playerW, sprite.offset + spriteW / 2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
            s.speed = s.maxSpeed / 5;
            s.position = Util.increase(playerSegment.p1.world.z, -s.playerZ, s.trackLength);
            break;
          }
        }
      }

      for (n = 0; n < playerSegment.cars.length; n++) {
        car = playerSegment.cars[n];
        carW = car.sprite.w * SPRITES.SCALE;
        if (s.speed > car.speed) {
          if (Util.overlap(s.playerX, playerW, car.offset, carW, 0.8)) {
            s.speed = car.speed * (car.speed / s.speed);
            s.position = Util.increase(car.z, -s.playerZ, s.trackLength);
            break;
          }
        }
      }

      s.playerX = Util.limit(s.playerX, -3, 3);
      s.speed = Util.limit(s.speed, 0, s.maxSpeed);

      s.skyOffset = Util.increase(s.skyOffset, s.skySpeed * playerSegment.curve * (s.position - startPosition) / s.segmentLength, 1);
      s.hillOffset = Util.increase(s.hillOffset, s.hillSpeed * playerSegment.curve * (s.position - startPosition) / s.segmentLength, 1);
      s.treeOffset = Util.increase(s.treeOffset, s.treeSpeed * playerSegment.curve * (s.position - startPosition) / s.segmentLength, 1);

      if (s.position > s.playerZ) {
        if (s.currentLapTime && (startPosition < s.playerZ)) {
          s.lastLapTime = s.currentLapTime;
          s.currentLapTime = 0;
          if (s.lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)) {
            Dom.storage.fast_lap_time = s.lastLapTime;
            Racer.Hud.update('fast_lap_time', Racer.Hud.formatTime(s.lastLapTime));
            Dom.addClassName('fast_lap_time', 'fastest');
            Dom.addClassName('last_lap_time', 'fastest');
          }
          else {
            Dom.removeClassName('fast_lap_time', 'fastest');
            Dom.removeClassName('last_lap_time', 'fastest');
          }
          Racer.Hud.update('last_lap_time', Racer.Hud.formatTime(s.lastLapTime));
          Dom.show('last_lap_time');
        }
        else {
          s.currentLapTime += dt;
        }
      }

      Racer.Hud.update('speed', 5 * Math.round(s.speed / 500));
      Racer.Hud.update('current_lap_time', Racer.Hud.formatTime(s.currentLapTime));
    },

    reset: function(options) {
      var s = Racer.State;
      options = options || {};

      s.canvas.width = s.width = Util.toInt(options.width, s.width);
      s.canvas.height = s.height = Util.toInt(options.height, s.height);
      s.lanes = Util.toInt(options.lanes, s.lanes);
      s.roadWidth = Util.toInt(options.roadWidth, s.roadWidth);
      s.cameraHeight = Util.toInt(options.cameraHeight, s.cameraHeight);
      s.drawDistance = Util.toInt(options.drawDistance, s.drawDistance);
      s.fogDensity = Util.toInt(options.fogDensity, s.fogDensity);
      s.fieldOfView = Util.toInt(options.fieldOfView, s.fieldOfView);
      s.segmentLength = Util.toInt(options.segmentLength, s.segmentLength);
      s.rumbleLength = Util.toInt(options.rumbleLength, s.rumbleLength);
      s.recalculateSpeedLimits();
      s.cameraDepth = 1 / Math.tan((s.fieldOfView / 2) * Math.PI / 180);
      s.playerZ = (s.cameraHeight * s.cameraDepth);
      s.resolution = s.height / 480;

      GameController.refreshTweakUI();

      if ((s.segments.length === 0) || (options.segmentLength) || (options.rumbleLength))
        Racer.Track.resetRoad();
    },

    refreshTweakUI: function() {
      var s = Racer.State;
      Dom.get('lanes').selectedIndex = s.lanes - 1;
      Dom.get('currentRoadWidth').innerHTML = Dom.get('roadWidth').value = s.roadWidth;
      Dom.get('currentCameraHeight').innerHTML = Dom.get('cameraHeight').value = s.cameraHeight;
      Dom.get('currentDrawDistance').innerHTML = Dom.get('drawDistance').value = s.drawDistance;
      Dom.get('currentFieldOfView').innerHTML = Dom.get('fieldOfView').value = s.fieldOfView;
      Dom.get('currentFogDensity').innerHTML = Dom.get('fogDensity').value = s.fogDensity;
    },

    bindTweakUI: function() {
      Dom.on('resolution', 'change', function(ev) {
        var w;
        var h;
        switch (ev.target.options[ev.target.selectedIndex].value) {
          case 'fine':   w = 1280; h = 960; break;
          case 'high':   w = 1024; h = 768; break;
          case 'medium': w = 640;  h = 480; break;
          case 'low':    w = 480;  h = 360; break;
        }
        GameController.reset({ width: w, height: h });
        Dom.blur(ev);
      });

      Dom.on('lanes',        'change', function(ev) { Dom.blur(ev); GameController.reset({ lanes:        ev.target.options[ev.target.selectedIndex].value }); });
      Dom.on('roadWidth',    'change', function(ev) { Dom.blur(ev); GameController.reset({ roadWidth:    Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
      Dom.on('cameraHeight', 'change', function(ev) { Dom.blur(ev); GameController.reset({ cameraHeight: Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
      Dom.on('drawDistance', 'change', function(ev) { Dom.blur(ev); GameController.reset({ drawDistance: Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
      Dom.on('fieldOfView',  'change', function(ev) { Dom.blur(ev); GameController.reset({ fieldOfView:  Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
      Dom.on('fogDensity',   'change', function(ev) { Dom.blur(ev); GameController.reset({ fogDensity:   Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
    },

    start: function() {
      var s = Racer.State;

      s.stats = Game.stats('fps');
      s.canvas = Dom.get('canvas');
      s.ctx = s.canvas.getContext('2d');

      Racer.Hud.init();
      GameController.bindTweakUI();

      Game.run({
        canvas: s.canvas,
        render: Racer.Renderer.render,
        update: GameController.update,
        stats: s.stats,
        step: s.step,
        images: ['background', 'sprites'],
        keys: [
          { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { s.input.left = true; } },
          { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { s.input.right = true; } },
          { keys: [KEY.UP,    KEY.W], mode: 'down', action: function() { s.input.faster = true; } },
          { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: function() { s.input.slower = true; } },
          { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { s.input.left = false; } },
          { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { s.input.right = false; } },
          { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { s.input.faster = false; } },
          { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { s.input.slower = false; } }
        ],
        ready: function(images) {
          s.background = images[0];
          s.sprites = images[1];
          GameController.reset();
          Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || 180;
          Racer.Hud.update('fast_lap_time', Racer.Hud.formatTime(Util.toFloat(Dom.storage.fast_lap_time)));
        }
      });
    }
  };

  Racer.GameController = GameController;
  Racer.GameController.start();
})(Racer);
