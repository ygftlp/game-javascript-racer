import type {
  RaceResult,
  RacerAdsService,
  RacerAnalyticsService,
  RacerLeaderboardService,
  RacerLeaderboardViewContext,
  RacerServices,
  RacerSocialService
} from './RacerServices';
import { RACER_WECHAT_SERVICES_CONFIG } from './RacerWechatConfig';

export interface WechatRacerShareConfig {
  titlePrefix: string;
  imageUrl?: string;
  query?: string;
}

export interface WechatRacerAdConfig {
  interstitialAdUnitId?: string;
  rewardedAdUnitId?: string;
}

export interface WechatRacerLeaderboardConfig {
  cloudFunctionName?: string;
  openDataContextCommand?: string;
}

export interface WechatRacerServicesConfig {
  share: WechatRacerShareConfig;
  ads: WechatRacerAdConfig;
  leaderboard: WechatRacerLeaderboardConfig;
  enableConsoleAnalytics: boolean;
}

type WechatCallback = (result?: unknown) => void;

type WechatApi = {
  shareAppMessage?: (options: {
    title: string;
    imageUrl?: string;
    query?: string;
    success?: WechatCallback;
    fail?: WechatCallback;
  }) => void;
  showShareMenu?: (options?: Record<string, unknown>) => void;
  createInterstitialAd?: (options: { adUnitId: string }) => WechatInterstitialAd;
  createRewardedVideoAd?: (options: { adUnitId: string }) => WechatRewardedVideoAd;
  getOpenDataContext?: () => { postMessage?: (message: Record<string, unknown>) => void };
  cloud?: {
    callFunction?: (options: {
      name: string;
      data?: Record<string, unknown>;
      success?: WechatCallback;
      fail?: WechatCallback;
    }) => void;
  };
  reportAnalytics?: (eventName: string, data?: Record<string, unknown>) => void;
};

type WechatInterstitialAd = {
  show: () => Promise<unknown>;
  load?: () => Promise<unknown>;
  destroy?: () => void;
  onError?: (callback: (error: unknown) => void) => void;
};

type WechatRewardedVideoAd = {
  show: () => Promise<unknown>;
  load?: () => Promise<unknown>;
  destroy?: () => void;
  onClose?: (callback: (result: { isEnded?: boolean }) => void) => void;
  offClose?: (callback: (result: { isEnded?: boolean }) => void) => void;
  onError?: (callback: (error: unknown) => void) => void;
};

export function createWechatRacerServices(config: WechatRacerServicesConfig = RACER_WECHAT_SERVICES_CONFIG): RacerServices | null {
  const wx = resolveWechatApi();
  if (!wx) return null;

  wx.showShareMenu?.({ withShareTicket: true });

  return {
    ads: new WechatAdsService(wx, config.ads),
    social: new WechatSocialService(wx, config.share),
    leaderboard: new WechatLeaderboardService(wx, config.leaderboard),
    analytics: new WechatAnalyticsService(wx, config.enableConsoleAnalytics)
  };
}

function resolveWechatApi(): WechatApi | null {
  const candidate = (globalThis as unknown as { wx?: WechatApi }).wx;
  if (!candidate) return null;
  return candidate;
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--';
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds - minutes * 60);
  const tenths = Math.floor(10 * (seconds - Math.floor(seconds)));
  return minutes > 0 ? `${minutes}:${wholeSeconds.toString().padStart(2, '0')}.${tenths}` : `${wholeSeconds}.${tenths}`;
}

function raceResultPayload(result: RaceResult): Record<string, unknown> {
  return {
    trackId: result.trackId,
    trackName: result.trackName,
    completedLaps: result.completedLaps,
    targetLaps: result.targetLaps,
    totalRaceTime: result.totalRaceTime,
    bestLapTime: result.bestLapTime
  };
}

class WechatSocialService implements RacerSocialService {
  constructor(private readonly wx: WechatApi, private readonly config: WechatRacerShareConfig) {}

  async shareResult(result: RaceResult): Promise<boolean> {
    if (!this.wx.shareAppMessage) return false;

    const title = `${this.config.titlePrefix} · ${result.trackName} ${formatSeconds(result.totalRaceTime)}`;
    const query = this.config.query ?? `track=${encodeURIComponent(result.trackId)}&best=${encodeURIComponent(formatSeconds(result.bestLapTime))}`;

    return new Promise((resolve) => {
      this.wx.shareAppMessage?.({
        title,
        query,
        imageUrl: this.config.imageUrl,
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    });
  }
}

class WechatLeaderboardService implements RacerLeaderboardService {
  constructor(private readonly wx: WechatApi, private readonly config: WechatRacerLeaderboardConfig) {}

  async submitScore(result: RaceResult): Promise<boolean> {
    const payload = raceResultPayload(result);

    if (this.config.cloudFunctionName && this.wx.cloud?.callFunction) {
      return new Promise((resolve) => {
        this.wx.cloud?.callFunction?.({
          name: this.config.cloudFunctionName,
          data: payload,
          success: () => resolve(true),
          fail: () => resolve(false)
        });
      });
    }

    const openDataContext = this.wx.getOpenDataContext?.();
    openDataContext?.postMessage?.({
      type: 'submitRacerScore',
      payload
    });
    return Boolean(openDataContext?.postMessage);
  }

  async showLeaderboard(context?: RacerLeaderboardViewContext): Promise<boolean> {
    const openDataContext = this.wx.getOpenDataContext?.();
    if (!openDataContext?.postMessage) return false;

    openDataContext.postMessage({
      type: this.config.openDataContextCommand ?? 'showRacerLeaderboard',
      context
    });
    return true;
  }
}

class WechatAdsService implements RacerAdsService {
  private interstitial: WechatInterstitialAd | null = null;
  private rewarded: WechatRewardedVideoAd | null = null;

  constructor(private readonly wx: WechatApi, private readonly config: WechatRacerAdConfig) {
    if (config.interstitialAdUnitId && wx.createInterstitialAd) {
      this.interstitial = wx.createInterstitialAd({ adUnitId: config.interstitialAdUnitId });
      this.interstitial.onError?.((error) => console.warn('[racer:wechat:ads] interstitial error', error));
    }
    if (config.rewardedAdUnitId && wx.createRewardedVideoAd) {
      this.rewarded = wx.createRewardedVideoAd({ adUnitId: config.rewardedAdUnitId });
      this.rewarded.onError?.((error) => console.warn('[racer:wechat:ads] rewarded error', error));
    }
  }

  async showInterstitial(placement: string): Promise<boolean> {
    if (!this.interstitial) return false;

    try {
      await this.interstitial.show();
      return true;
    } catch (error) {
      console.warn('[racer:wechat:ads] interstitial show failed', placement, error);
      try {
        await this.interstitial.load?.();
      } catch {
        // Ads are optional and should never block gameplay.
      }
      return false;
    }
  }

  async showRewarded(placement: string): Promise<boolean> {
    if (!this.rewarded) return false;

    return new Promise((resolve) => {
      const onClose = (result: { isEnded?: boolean }) => {
        this.rewarded?.offClose?.(onClose);
        resolve(Boolean(result?.isEnded));
      };

      this.rewarded?.onClose?.(onClose);
      this.rewarded?.show()
        .catch(async (error) => {
          console.warn('[racer:wechat:ads] rewarded show failed', placement, error);
          try {
            await this.rewarded?.load?.();
            await this.rewarded?.show();
          } catch {
            this.rewarded?.offClose?.(onClose);
            resolve(false);
          }
        });
    });
  }
}

class WechatAnalyticsService implements RacerAnalyticsService {
  constructor(private readonly wx: WechatApi, private readonly enableConsole: boolean) {}

  track(eventName: string, data: unknown = {}): void {
    const payload = typeof data === 'object' && data !== null ? data as Record<string, unknown> : { value: data };
    this.wx.reportAnalytics?.(eventName, payload);
    if (this.enableConsole) console.log('[racer:wechat:analytics]', eventName, payload);
  }
}
