(function(Racer) {
  var Renderer = {
    render: function() {
      var s = Racer.State;
      var background = Racer.BackgroundMap.current();
      var baseSegment = Racer.Track.findSegment(s.position);
      var basePercent = Util.percentRemaining(s.position, s.segmentLength);
      var playerSegment = Racer.Track.findSegment(s.position + s.playerZ);
      var playerPercent = Util.percentRemaining(s.position + s.playerZ, s.segmentLength);
      var playerY = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
      var maxy = s.height;
      var x = 0;
      var dx = -(baseSegment.curve * basePercent);
      var n;
      var i;
      var segment;
      var car;
      var sprite;
      var spriteScale;
      var spriteX;
      var spriteY;

      s.ctx.clearRect(0, 0, s.width, s.height);

      Render.background(s.ctx, s.background, s.width, s.height, background.SKY, s.skyOffset, s.resolution * s.skySpeed * playerY);
      Render.background(s.ctx, s.background, s.width, s.height, background.HILLS, s.hillOffset, s.resolution * s.hillSpeed * playerY);
      Render.background(s.ctx, s.background, s.width, s.height, background.TREES, s.treeOffset, s.resolution * s.treeSpeed * playerY);

      for (n = 0; n < s.drawDistance; n++) {
        segment = s.segments[(baseSegment.index + n) % s.segments.length];
        segment.looped = segment.index < baseSegment.index;
        segment.fog = Util.exponentialFog(n / s.drawDistance, s.fogDensity);
        segment.clip = maxy;

        Util.project(segment.p1, (s.playerX * s.roadWidth) - x, playerY + s.cameraHeight, s.position - (segment.looped ? s.trackLength : 0), s.cameraDepth, s.width, s.height, s.roadWidth);
        Util.project(segment.p2, (s.playerX * s.roadWidth) - x - dx, playerY + s.cameraHeight, s.position - (segment.looped ? s.trackLength : 0), s.cameraDepth, s.width, s.height, s.roadWidth);

        x = x + dx;
        dx = dx + segment.curve;

        if ((segment.p1.camera.z <= s.cameraDepth) ||
            (segment.p2.screen.y >= segment.p1.screen.y) ||
            (segment.p2.screen.y >= maxy))
          continue;

        Render.segment(s.ctx, s.width, s.lanes,
                       segment.p1.screen.x,
                       segment.p1.screen.y,
                       segment.p1.screen.w,
                       segment.p2.screen.x,
                       segment.p2.screen.y,
                       segment.p2.screen.w,
                       segment.fog,
                       segment.color);

        maxy = segment.p1.screen.y;
      }

      for (n = (s.drawDistance - 1); n > 0; n--) {
        segment = s.segments[(baseSegment.index + n) % s.segments.length];

        for (i = 0; i < segment.cars.length; i++) {
          car = segment.cars[i];
          spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
          spriteX = Util.interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + (spriteScale * car.offset * s.roadWidth * s.width / 2);
          spriteY = Util.interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent);
          Render.sprite(s.ctx, s.width, s.height, s.resolution, s.roadWidth, s.sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
        }

        for (i = 0; i < segment.sprites.length; i++) {
          sprite = segment.sprites[i];
          spriteScale = segment.p1.screen.scale;
          spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * s.roadWidth * s.width / 2);
          spriteY = segment.p1.screen.y;
          Render.sprite(s.ctx, s.width, s.height, s.resolution, s.roadWidth, s.sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
        }

        if (segment === playerSegment) {
          Render.player(s.ctx, s.width, s.height, s.resolution, s.roadWidth, s.sprites, s.speed / s.maxSpeed,
                        s.cameraDepth / s.playerZ,
                        s.width / 2,
                        (s.height / 2) - (s.cameraDepth / s.playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * s.height / 2),
                        s.speed * (s.input.left ? -1 : s.input.right ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
        }
      }
    }
  };

  Racer.Renderer = Renderer;
})(Racer);
