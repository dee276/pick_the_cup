---
name: SSE live notifications
description: Server-Sent Events for real-time match alerts (goals, match start/end).
---

# SSE Notifications — FanSphere

## Architecture
- Endpoint: `GET /api/events/stream`
- Long-lived SSE connection (Content-Type: text/event-stream)
- 25s heartbeat to keep connection alive
- 30s polling interval for score changes

## Events emitted
- `goal` — when homeScore or awayScore changes for a live match
- `match_started` — when status transitions to "live"
- `match_ended` — when status transitions to "finished" or "ft"
- `connected` — once on connection established

## Client hook
- `useNotifications()` in `artifacts/fansphere/src/hooks/useNotifications.ts`
- Uses native `EventSource` API with `withCredentials: true`
- Shows toast notifications via shadcn Toaster on goal/match events
- Mounted at app level in `AppWithNotifications` wrapper in App.tsx

## Preference learning
- `POST /api/interactions` records user behavior with weights: favorite(5), predict(3), watch_highlight(2), view(1)
- `userPreferences` table stores team scores, group interests, highlight views per Clerk userId
- `GET /api/preferences` returns sorted team recommendations
