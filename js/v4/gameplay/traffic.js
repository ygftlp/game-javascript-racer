(function(Racer) {
  var Traffic = {
    resetCars: function() {
      var s = Racer.State;
      var n;
      var car;
      var segment;
      var offset;
      var z;
      var sprite;
      var speed;

      s.cars = [];
      for (n = 0; n < s.totalCars; n++) {
        offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
        z = Math.floor(Math.random() * s.segments.length) * s.segmentLength;
        sprite = Util.randomChoice(SPRITES.CARS);
        speed = s.maxSpeed / 4 + Math.random() * s.maxSpeed / (sprite === SPRITES.SEMI ? 4 : 2);
        car = { offset: offset, z: z, sprite: sprite, speed: speed };
        segment = Racer.Track.findSegment(car.z);
        segment.cars.push(car);
        s.cars.push(car);
      }
    },

    updateCars: function(dt, playerSegment, playerW) {
      var s = Racer.State;
      var n;
      var car;
      var oldSegment;
      var newSegment;
      var index;

      for (n = 0; n < s.cars.length; n++) {
        car = s.cars[n];
        oldSegment = Racer.Track.findSegment(car.z);
        car.offset = car.offset + Traffic.updateCarOffset(car, oldSegment, playerSegment, playerW);
        car.z = Util.increase(car.z, dt * car.speed, s.trackLength);
        car.percent = Util.percentRemaining(car.z, s.segmentLength);
        newSegment = Racer.Track.findSegment(car.z);
        if (oldSegment !== newSegment) {
          index = oldSegment.cars.indexOf(car);
          oldSegment.cars.splice(index, 1);
          newSegment.cars.push(car);
        }
      }
    },

    updateCarOffset: function(car, carSegment, playerSegment, playerW) {
      var s = Racer.State;
      var i;
      var j;
      var dir;
      var segment;
      var otherCar;
      var otherCarW;
      var lookahead = 20;
      var carW = car.sprite.w * SPRITES.SCALE;

      if ((carSegment.index - playerSegment.index) > s.drawDistance)
        return 0;

      for (i = 1; i < lookahead; i++) {
        segment = s.segments[(carSegment.index + i) % s.segments.length];

        if ((segment === playerSegment) && (car.speed > s.speed) && (Util.overlap(s.playerX, playerW, car.offset, carW, 1.2))) {
          if (s.playerX > 0.5)
            dir = -1;
          else if (s.playerX < -0.5)
            dir = 1;
          else
            dir = (car.offset > s.playerX) ? 1 : -1;
          return dir * 1 / i * (car.speed - s.speed) / s.maxSpeed;
        }

        for (j = 0; j < segment.cars.length; j++) {
          otherCar = segment.cars[j];
          otherCarW = otherCar.sprite.w * SPRITES.SCALE;
          if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
            if (otherCar.offset > 0.5)
              dir = -1;
            else if (otherCar.offset < -0.5)
              dir = 1;
            else
              dir = (car.offset > otherCar.offset) ? 1 : -1;
            return dir * 1 / i * (car.speed - otherCar.speed) / s.maxSpeed;
          }
        }
      }

      if (car.offset < -0.9)
        return 0.1;
      else if (car.offset > 0.9)
        return -0.1;
      else
        return 0;
    }
  };

  Racer.Traffic = Traffic;
})(Racer);
