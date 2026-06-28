export interface RacerUiFlags {
  releaseMode: boolean;
  showDebugHud: boolean;
  showAssetStatus: boolean;
  showPerformanceStatus: boolean;
  showControlLabels: boolean;
  showPlayerVisibilityMarker: boolean;
}

export const RACER_UI_FLAGS: RacerUiFlags = {
  releaseMode: true,
  showDebugHud: false,
  showAssetStatus: false,
  showPerformanceStatus: false,
  showControlLabels: true,
  showPlayerVisibilityMarker: false
};
