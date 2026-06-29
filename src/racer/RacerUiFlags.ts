export interface RacerUiFlags {
  releaseMode: boolean;
  showDebugHud: boolean;
  showAssetStatus: boolean;
  showPerformanceStatus: boolean;
  showControlLabels: boolean;
  showMiniMap: boolean;
  showFirstRaceCoach: boolean;
  showPlayerVisibilityMarker: boolean;
}

export const RACER_UI_FLAGS: RacerUiFlags = {
  releaseMode: true,
  showDebugHud: false,
  showAssetStatus: false,
  showPerformanceStatus: false,
  showControlLabels: false,
  showMiniMap: true,
  showFirstRaceCoach: true,
  showPlayerVisibilityMarker: false
};
