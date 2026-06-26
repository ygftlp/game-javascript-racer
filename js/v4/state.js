(function(window) {
  window.Racer = window.Racer || {};

  var state = {
    fps: 60,
    step: 1 / 60,

    width: 1024,
    height: 768,

    centrifugal: 0.3,
    skySpeed: 0.001,
    hillSpeed: 0.002,
    treeSpeed: 0.003,
    skyOffset: 0,
    hillOffset: 0,
    treeOffset: 0,

    segments: [],
    cars: [],

    stats: null,
    canvas: null,
    ctx: null,
    background: null,
    sprites: null,

    resolution: null,
    roadWidth: 2000,
    segmentLength: 200,
    rumbleLength: 3,
    trackLength: null,
    lanes: 3,
    fieldOfView: 100,
    cameraHeight: 1000,
    cameraDepth: null,
    drawDistance: 300,
    playerX: 0,
    playerZ: null,
    fogDensity: 5,
    position: 0,
    speed: 0,

    maxSpeed: null,
    accel: null,
    breaking: null,
    decel: null,
    offRoadDecel: null,
    offRoadLimit: null,

    totalCars: 200,
    currentLapTime: 0,
    lastLapTime: null,

    input: {
      left: false,
      right: false,
      faster: false,
      slower: false
    },

    hud: {}
  };

  state.recalculateSpeedLimits = function() {
    state.maxSpeed = state.segmentLength / state.step;
    state.accel = state.maxSpeed / 5;
    state.breaking = -state.maxSpeed;
    state.decel = -state.maxSpeed / 5;
    state.offRoadDecel = -state.maxSpeed / 2;
    state.offRoadLimit = state.maxSpeed / 4;
  };

  state.recalculateSpeedLimits();

  window.Racer.State = state;
})(window);
