import { createWechatRacerServices, DEFAULT_WECHAT_RACER_SERVICES_CONFIG, type WechatRacerServicesConfig } from './RacerWechatServices';

export interface RaceResult {
  trackId: string;
  trackName: string;
  completedLaps: number;
  targetLaps: number;
  totalRaceTime: number;
  bestLapTime: number;
}

export interface RacerAdsService {
  showInterstitial(placement: string): Promise<boolean>;
  showRewarded(placement: string): Promise<boolean>;
}

export interface RacerSocialService {
  shareResult(result: RaceResult): Promise<boolean>;
}

export interface RacerLeaderboardService {
  submitScore(result: RaceResult): Promise<boolean>;
  showLeaderboard(): Promise<boolean>;
}

export interface RacerAnalyticsService {
  track(eventName: string, data?: unknown): void;
}

export interface RacerServices {
  ads: RacerAdsService;
  social: RacerSocialService;
  leaderboard: RacerLeaderboardService;
  analytics: RacerAnalyticsService;
}

class NoopAdsService implements RacerAdsService {
  async showInterstitial(placement: string): Promise<boolean> {
    console.log('[racer:ads] interstitial fallback', placement);
    return false;
  }

  async showRewarded(placement: string): Promise<boolean> {
    console.log('[racer:ads] rewarded fallback', placement);
    return false;
  }
}

class NoopSocialService implements RacerSocialService {
  async shareResult(result: RaceResult): Promise<boolean> {
    console.log('[racer:social] share fallback', result);
    return false;
  }
}

class NoopLeaderboardService implements RacerLeaderboardService {
  async submitScore(result: RaceResult): Promise<boolean> {
    console.log('[racer:leaderboard] submit fallback', result);
    return false;
  }

  async showLeaderboard(): Promise<boolean> {
    console.log('[racer:leaderboard] show fallback');
    return false;
  }
}

class ConsoleAnalyticsService implements RacerAnalyticsService {
  track(eventName: string, data: unknown = {}): void {
    console.log('[racer:analytics]', eventName, data);
  }
}

function createNoopRacerServices(): RacerServices {
  return {
    ads: new NoopAdsService(),
    social: new NoopSocialService(),
    leaderboard: new NoopLeaderboardService(),
    analytics: new ConsoleAnalyticsService()
  };
}

export function createRacerServices(config: WechatRacerServicesConfig = DEFAULT_WECHAT_RACER_SERVICES_CONFIG): RacerServices {
  return createWechatRacerServices(config) ?? createNoopRacerServices();
}
