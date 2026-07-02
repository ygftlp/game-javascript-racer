/*
 * Sample WeChat open data context leaderboard handler for the racer.
 *
 * Copy this into the open data context project and adapt rendering/storage for
 * your real leaderboard UI. This file is documentation sample code only; it is
 * not imported by the main game bundle.
 *
 * Optional: load docs/samples/open-data-leaderboard-canvas.js before this file
 * to render the leaderboard on sharedCanvas instead of console output.
 */

const SCORE_KEY_PREFIX = 'racer.score.';

/** @typedef {{trackId:string,trackName:string,completedLaps:number,targetLaps:number,totalRaceTime:number,bestLapTime:number}} RacerScorePayload */
/** @typedef {{source:string,trackId:string,trackName:string}} RacerLeaderboardContext */

function isValidScorePayload(payload) {
  return Boolean(
    payload &&
    typeof payload.trackId === 'string' &&
    typeof payload.trackName === 'string' &&
    Number.isFinite(payload.completedLaps) &&
    Number.isFinite(payload.targetLaps) &&
    Number.isFinite(payload.totalRaceTime) &&
    Number.isFinite(payload.bestLapTime)
  );
}

function scoreStorageKey(trackId) {
  return `${SCORE_KEY_PREFIX}${trackId}`;
}

function serializeScore(payload) {
  return JSON.stringify({
    trackId: payload.trackId,
    trackName: payload.trackName,
    completedLaps: payload.completedLaps,
    targetLaps: payload.targetLaps,
    totalRaceTime: payload.totalRaceTime,
    bestLapTime: payload.bestLapTime,
    updatedAt: Date.now()
  });
}

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--';
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds - minutes * 60);
  const tenths = Math.floor(10 * (seconds - Math.floor(seconds)));
  return minutes > 0 ? `${minutes}:${String(wholeSeconds).padStart(2, '0')}.${tenths}` : `${wholeSeconds}.${tenths}`;
}

function submitRacerScore(payload) {
  if (!isValidScorePayload(payload)) {
    console.warn('[open-data:racer] invalid submitRacerScore payload', payload);
    return;
  }

  if (typeof wx === 'undefined' || !wx.setUserCloudStorage) {
    console.warn('[open-data:racer] wx.setUserCloudStorage unavailable');
    return;
  }

  wx.setUserCloudStorage({
    KVDataList: [
      {
        key: scoreStorageKey(payload.trackId),
        value: serializeScore(payload)
      }
    ],
    success: () => console.log('[open-data:racer] score saved', payload.trackId),
    fail: (error) => console.warn('[open-data:racer] score save failed', error)
  });
}

function showRacerLeaderboard(context) {
  if (!context || typeof context.trackId !== 'string') {
    console.warn('[open-data:racer] invalid leaderboard context', context);
    return;
  }

  if (typeof wx === 'undefined' || !wx.getFriendCloudStorage) {
    console.warn('[open-data:racer] wx.getFriendCloudStorage unavailable');
    renderEmptyLeaderboard(context, '排行榜暂不可用');
    return;
  }

  wx.getFriendCloudStorage({
    keyList: [scoreStorageKey(context.trackId)],
    success: ({ data }) => {
      const rows = parseLeaderboardRows(data, context.trackId);
      renderLeaderboard(context, rows);
    },
    fail: (error) => {
      console.warn('[open-data:racer] leaderboard fetch failed', error);
      renderEmptyLeaderboard(context, '排行榜加载失败');
    }
  });
}

function parseLeaderboardRows(data, trackId) {
  return (data || [])
    .map((friend) => {
      const kv = (friend.KVDataList || []).find((item) => item.key === scoreStorageKey(trackId));
      if (!kv?.value) return null;

      try {
        const score = JSON.parse(kv.value);
        if (!Number.isFinite(score.totalRaceTime)) return null;
        return {
          nickname: friend.nickname || '玩家',
          avatarUrl: friend.avatarUrl || '',
          trackId: score.trackId,
          trackName: score.trackName,
          totalRaceTime: score.totalRaceTime,
          bestLapTime: score.bestLapTime,
          updatedAt: score.updatedAt || 0
        };
      } catch (error) {
        console.warn('[open-data:racer] bad score json', error);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.totalRaceTime - b.totalRaceTime || a.bestLapTime - b.bestLapTime)
    .slice(0, 20);
}

function renderLeaderboard(context, rows) {
  if (typeof renderRacerLeaderboardCanvas === 'function') {
    renderRacerLeaderboardCanvas(context, rows);
    return;
  }

  console.log(`[open-data:racer] ${context.trackName} leaderboard from ${context.source}`);
  if (!rows.length) {
    renderEmptyLeaderboard(context, '暂无好友成绩');
    return;
  }

  rows.forEach((row, index) => {
    console.log(
      `${index + 1}. ${row.nickname} total=${formatSeconds(row.totalRaceTime)} best=${formatSeconds(row.bestLapTime)}`
    );
  });
}

function renderEmptyLeaderboard(context, message) {
  if (typeof renderEmptyRacerLeaderboardCanvas === 'function') {
    renderEmptyRacerLeaderboardCanvas(context, message);
    return;
  }

  console.log(`[open-data:racer] ${context?.trackName || '赛道'} ${message}`);
}

function handleRacerOpenDataMessage(message) {
  if (!message || typeof message.type !== 'string') return;

  if (message.type === 'submitRacerScore') {
    submitRacerScore(message.payload);
    return;
  }

  if (message.type === 'showRacerLeaderboard') {
    showRacerLeaderboard(message.context);
    return;
  }

  console.log('[open-data:racer] ignored message', message.type);
}

if (typeof wx !== 'undefined' && wx.onMessage) {
  wx.onMessage(handleRacerOpenDataMessage);
}

// Export for local tests or bundlers used by the open data context project.
if (typeof module !== 'undefined') {
  module.exports = {
    handleRacerOpenDataMessage,
    isValidScorePayload,
    parseLeaderboardRows,
    scoreStorageKey
  };
}
