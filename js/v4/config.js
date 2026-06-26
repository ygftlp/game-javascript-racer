(function(Racer) {
  Racer.Config = {
    product: {
      id: 'retro-racer-v4',
      name: 'Retro Racer',
      version: '0.1.0-commercial-scaffold'
    },

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
    },

    platform: {
      provider: 'standalone',
      allowIframe: true
    },

    monetization: {
      adsEnabled: false,
      provider: 'none',
      placements: {
        gameStart: 'game_start',
        lapComplete: 'lap_complete',
        resultScreen: 'result_screen',
        rewardedContinue: 'rewarded_continue'
      }
    },

    analytics: {
      enabled: false,
      provider: 'none'
    },

    storage: {
      enabled: true,
      namespace: 'racer.v4',
      fastLapKey: 'fast_lap_time'
    }
  };
})(Racer);
