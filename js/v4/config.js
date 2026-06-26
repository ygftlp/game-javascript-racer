(function(Racer) {
  Racer.Config = {
    images: ['background', 'sprites'],
    defaultFastLapTime: 180,

    resolutions: {
      fine:   { width: 1280, height: 960 },
      high:   { width: 1024, height: 768 },
      medium: { width: 640,  height: 480 },
      low:    { width: 480,  height: 360 }
    },

    controls: {
      left:   [KEY.LEFT,  KEY.A],
      right:  [KEY.RIGHT, KEY.D],
      faster: [KEY.UP,    KEY.W],
      slower: [KEY.DOWN,  KEY.S]
    }
  };
})(Racer);
