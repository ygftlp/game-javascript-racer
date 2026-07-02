/*
 * Sample Canvas renderer for the racer open data context leaderboard.
 *
 * This file is documentation sample code only; it is not imported by the main
 * game bundle. Copy it into the WeChat open data context project and call
 * renderRacerLeaderboardCanvas(context, rows) from the message handler.
 */

const RACER_LEADERBOARD_CANVAS_THEME = {
  background: 'rgba(5, 9, 22, 0.92)',
  panel: 'rgba(10, 18, 38, 0.96)',
  panelStroke: 'rgba(255, 218, 116, 0.55)',
  title: '#FFE08A',
  subtitle: '#B8C7EA',
  row: 'rgba(255, 255, 255, 0.065)',
  rowAlt: 'rgba(255, 255, 255, 0.035)',
  rowStroke: 'rgba(255, 255, 255, 0.08)',
  primaryText: '#FFFFFF',
  secondaryText: '#9FB0D6',
  accent: '#FFD45D',
  muted: '#6F7D9E',
  medalGold: '#FFD45D',
  medalSilver: '#C9D6F2',
  medalBronze: '#D99A5C',
  emptyText: '#DDE6FF'
};

const avatarCache = new Map();
let latestRenderRequest = null;

function resolveOpenDataCanvas() {
  if (typeof wx !== 'undefined' && wx.getSharedCanvas) return wx.getSharedCanvas();
  if (typeof sharedCanvas !== 'undefined') return sharedCanvas;
  return null;
}

function renderRacerLeaderboardCanvas(context, rows, options = {}) {
  const canvas = options.canvas || resolveOpenDataCanvas();
  if (!canvas) {
    console.warn('[open-data:racer:canvas] shared canvas unavailable');
    return false;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const width = options.width || canvas.width || 640;
  const height = options.height || canvas.height || 960;
  const safeRows = Array.isArray(rows) ? rows : [];
  const theme = { ...RACER_LEADERBOARD_CANVAS_THEME, ...(options.theme || {}) };

  latestRenderRequest = { context, rows: safeRows, options };

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, theme);
  drawPanel(ctx, width, height, theme);
  drawHeader(ctx, context, width, theme);

  if (!safeRows.length) {
    drawEmptyState(ctx, context, '暂无好友成绩', width, height, theme);
    return true;
  }

  drawLeaderboardRows(ctx, safeRows, width, height, theme);
  return true;
}

function renderEmptyRacerLeaderboardCanvas(context, message, options = {}) {
  const canvas = options.canvas || resolveOpenDataCanvas();
  if (!canvas) {
    console.warn('[open-data:racer:canvas] shared canvas unavailable');
    return false;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const width = options.width || canvas.width || 640;
  const height = options.height || canvas.height || 960;
  const theme = { ...RACER_LEADERBOARD_CANVAS_THEME, ...(options.theme || {}) };

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, theme);
  drawPanel(ctx, width, height, theme);
  drawHeader(ctx, context, width, theme);
  drawEmptyState(ctx, context, message || '排行榜暂不可用', width, height, theme);
  return true;
}

function drawBackground(ctx, width, height, theme) {
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.18);
  ctx.lineTo(width, height * 0.08);
  ctx.lineTo(width, height * 0.18);
  ctx.lineTo(0, height * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPanel(ctx, width, height, theme) {
  const margin = Math.max(24, width * 0.055);
  const x = margin;
  const y = Math.max(36, height * 0.055);
  const w = width - margin * 2;
  const h = height - y * 2;

  ctx.fillStyle = theme.panel;
  roundedRectPath(ctx, x, y, w, h, 28);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = theme.panelStroke;
  ctx.stroke();
}

function drawHeader(ctx, context, width, theme) {
  const title = context?.trackName || '赛道排行榜';
  const subtitle = context?.source === 'result' ? '本局成绩 · 好友排名' : '好友排名 · 按赛道统计';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.title;
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, width / 2, 88);

  ctx.fillStyle = theme.subtitle;
  ctx.font = '22px sans-serif';
  ctx.fillText(subtitle, width / 2, 126);
}

function drawLeaderboardRows(ctx, rows, width, height, theme) {
  const left = Math.max(44, width * 0.08);
  const right = width - left;
  const startY = 172;
  const rowHeight = 72;
  const gap = 10;
  const maxRows = Math.min(rows.length, Math.floor((height - startY - 70) / (rowHeight + gap)));

  for (let index = 0; index < maxRows; index += 1) {
    const row = rows[index];
    const y = startY + index * (rowHeight + gap);
    drawLeaderboardRow(ctx, row, index, left, right, y, rowHeight, theme);
  }
}

function drawLeaderboardRow(ctx, row, index, left, right, y, height, theme) {
  const width = right - left;
  ctx.fillStyle = index % 2 === 0 ? theme.row : theme.rowAlt;
  roundedRectPath(ctx, left, y, width, height, 18);
  ctx.fill();
  ctx.strokeStyle = theme.rowStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  drawRankBadge(ctx, index, left + 30, y + height / 2, theme);
  drawAvatar(ctx, row, left + 78, y + height / 2, 42, theme);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.primaryText;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(trimText(ctx, row.nickname || '玩家', 165), left + 112, y + 27);

  ctx.fillStyle = theme.secondaryText;
  ctx.font = '18px sans-serif';
  ctx.fillText(`最佳圈 ${formatSeconds(row.bestLapTime)}`, left + 112, y + 52);

  ctx.textAlign = 'right';
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText(formatSeconds(row.totalRaceTime), right - 24, y + height / 2);
}

function drawRankBadge(ctx, index, x, y, theme) {
  const rank = index + 1;
  const medal = rank === 1 ? theme.medalGold : rank === 2 ? theme.medalSilver : rank === 3 ? theme.medalBronze : theme.muted;

  ctx.fillStyle = medal;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#071021';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(rank), x, y + 1);
}

function drawAvatar(ctx, row, x, y, size, theme) {
  const radius = size / 2;
  const image = getAvatarImage(row?.avatarUrl);

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();

  if (image?.complete || image?.width > 0) {
    ctx.drawImage(image, x - radius, y - radius, size, size);
  } else {
    ctx.fillStyle = theme.panelStroke;
    ctx.fillRect(x - radius, y - radius, size, size);
    ctx.fillStyle = '#071021';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((row?.nickname || '玩').slice(0, 1), x, y + 1);
  }

  ctx.restore();
  ctx.strokeStyle = theme.panelStroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function getAvatarImage(url) {
  if (!url || typeof wx === 'undefined' || !wx.createImage) return null;
  if (avatarCache.has(url)) return avatarCache.get(url);

  const image = wx.createImage();
  image.onload = () => {
    if (latestRenderRequest) {
      renderRacerLeaderboardCanvas(latestRenderRequest.context, latestRenderRequest.rows, latestRenderRequest.options);
    }
  };
  image.onerror = () => console.warn('[open-data:racer:canvas] avatar load failed', url);
  image.src = url;
  avatarCache.set(url, image);
  return image;
}

function drawEmptyState(ctx, context, message, width, height, theme) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = theme.emptyText;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(message || '暂无好友成绩', width / 2, height * 0.46);

  ctx.fillStyle = theme.secondaryText;
  ctx.font = '20px sans-serif';
  ctx.fillText(context?.trackName ? `赛道：${context.trackName}` : '完成一局后刷新排行榜', width / 2, height * 0.46 + 42);
}

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--';
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds - minutes * 60);
  const tenths = Math.floor(10 * (seconds - Math.floor(seconds)));
  return minutes > 0 ? `${minutes}:${String(wholeSeconds).padStart(2, '0')}.${tenths}` : `${wholeSeconds}.${tenths}`;
}

function trimText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let output = text;
  while (output.length > 1 && ctx.measureText(`${output}…`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}…`;
}

function roundedRectPath(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

if (typeof module !== 'undefined') {
  module.exports = {
    RACER_LEADERBOARD_CANVAS_THEME,
    renderRacerLeaderboardCanvas,
    renderEmptyRacerLeaderboardCanvas,
    formatSeconds
  };
}
