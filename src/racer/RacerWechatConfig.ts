import type { WechatRacerServicesConfig } from './RacerWechatServices';

/**
 * WeChat platform service configuration.
 *
 * Do not commit production-only secrets.
 * Keep secrets and production-only identifiers out of public source. This file is
 * intentionally a safe default template: share image, cloud function name, and
 * ad unit IDs are optional and should be filled through a private release patch
 * or build-time replacement before publishing.
 */
export const RACER_WECHAT_SERVICES_CONFIG: WechatRacerServicesConfig = {
  share: {
    titlePrefix: '极速公路'
    // imageUrl: 'assets/packs/default/images/share-card.png',
    // query: 'from=share'
  },
  leaderboard: {
    openDataContextCommand: 'showRacerLeaderboard'
    // cloudFunctionName: 'submitRacerScore'
  },
  ads: {
    // interstitialAdUnitId: 'adunit-your-interstitial-id',
    // rewardedAdUnitId: 'adunit-your-rewarded-id'
  },
  enableConsoleAnalytics: true
};