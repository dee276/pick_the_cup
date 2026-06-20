---
name: TheSportsDB integration
description: Free API for WC 2026 real match data — endpoints, caching, and rate limit rules.
---

# TheSportsDB — FanSphere

## Config
- Base URL: `https://www.thesportsdb.com/api/v1/json/3`
- WC 2026 League ID: `4429`
- No API key needed (free tier key=`3` in URL)

## Key endpoints
- `eventsday.php?d=YYYY-MM-DD&s=Soccer` — matches by day
- `lookupevent.php?id=EVENT_ID` — event detail (includes strVideo YouTube URL)
- `lookuptable.php?l=4429&s=2026` — standings

## Caching
- 60s in-memory cache in `sportsdb.ts` (Map-based)
- Filter events by `idLeague === "4429"` OR `strLeague === "FIFA World Cup"`

## Rate limits
- Rapid bulk calls hit rate limits — use 400ms+ between bulk requests
- Standings API sometimes returns partial data (5 entries only)

## YouTube videos
- `strVideo` field on event detail contains YouTube URL for some matches
- Use `extractYouTubeId()` to parse
- Curated known IDs stored in `CURATED_HIGHLIGHTS` map in highlights route
