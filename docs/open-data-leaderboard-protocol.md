# Open Data Leaderboard Protocol

This document defines the message contract between the main WeChat mini game domain and the open data context leaderboard renderer.

The main domain sends messages from `src/racer/RacerWechatServices.ts` through:

```ts
wx.getOpenDataContext()?.postMessage(message)
```

## Message: `submitRacerScore`

Sent after race finish when cloud submission is not configured.

```ts
{
  type: 'submitRacerScore',
  payload: {
    trackId: string,
    trackName: string,
    completedLaps: number,
    targetLaps: number,
    totalRaceTime: number,
    bestLapTime: number
  }
}
```

Field notes:

- `trackId`: stable id from `RacerTrackDefinition.ts`, used as the leaderboard key.
- `trackName`: player-facing Chinese track name.
- `completedLaps`: laps completed when the race finished.
- `targetLaps`: configured target laps for the selected track.
- `totalRaceTime`: race completion time in seconds.
- `bestLapTime`: best lap in seconds.

Recommended ranking sort:

1. Sort by lower `totalRaceTime` for finished races.
2. Use lower `bestLapTime` as tie-breaker.
3. Separate boards by `trackId`.

## Message: `showRacerLeaderboard`

Sent when the player taps leaderboard from menu or result screen.

```ts
{
  type: 'showRacerLeaderboard',
  context: {
    source: string,
    trackId: string,
    trackName: string
  }
}
```

Field notes:

- `source`: `menu` or `result` from the current game UI.
- `trackId`: selected track id to show.
- `trackName`: selected track display name.

The default command name comes from `src/racer/RacerWechatConfig.ts`:

```ts
leaderboard: {
  openDataContextCommand: 'showRacerLeaderboard'
}
```

If the command name changes, update both `RacerWechatConfig.ts` and the open data context handler.

## Open data context storage key

Recommended per-track key:

```text
racer.score.${trackId}
```

For WeChat friend rankings, mirror that key when writing user cloud storage:

```ts
wx.setUserCloudStorage({
  KVDataList: [
    {
      key: `racer.score.${trackId}`,
      value: JSON.stringify({
        trackId,
        trackName,
        totalRaceTime,
        bestLapTime,
        completedLaps,
        targetLaps,
        updatedAt: Date.now()
      })
    }
  ]
})
```

## Sample files

Protocol and behavior sample:

```text
docs/samples/open-data-leaderboard-handler.js
```

Canvas UI renderer sample:

```text
docs/samples/open-data-leaderboard-canvas.js
```

Recommended open data load order:

```js
require('./open-data-leaderboard-canvas.js')
require('./open-data-leaderboard-handler.js')
```

When the Canvas renderer is loaded first, the handler automatically calls:

```js
renderRacerLeaderboardCanvas(context, rows)
renderEmptyRacerLeaderboardCanvas(context, message)
```

If the renderer is not loaded, the handler falls back to console output for debugging.

## Canvas renderer behavior

The Canvas renderer sample draws:

- title and source subtitle
- friend rank rows
- avatar image with nickname fallback
- top-three rank badges
- total race time
- best lap tie-breaker
- empty state
- malformed or unavailable storage fallback state

Replace the sample visual theme and Canvas layout before final release.

## Failure behavior

- Unknown message types should be ignored.
- Invalid payloads should not throw; log and return.
- Missing score data should render an empty state.
- The main domain must not block gameplay waiting for the open data context.

## QA checklist

- Finish a race on each selectable track.
- Confirm `submitRacerScore` includes `trackId` and `trackName`.
- Tap leaderboard from the main menu and result screen.
- Confirm `showRacerLeaderboard` includes `source`, `trackId`, and `trackName`.
- Confirm each track displays a separate ranking key.
- Confirm the Canvas renderer draws title, avatar/fallback, total time, best lap, and empty state.
- Confirm malformed messages do not crash the open data context.
