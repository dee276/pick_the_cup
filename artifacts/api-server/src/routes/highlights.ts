import { Router } from "express";
import { getEventsByDay, getEventDetail, extractYouTubeId, flagEmoji, statusToAppStatus } from "../services/sportsdb";

const router = Router();

// Curated highlights from TheSportsDB video URLs + known matches
// videoId = confirmed YouTube video ID from TheSportsDB strVideo field
// thumb from YouTube if we have videoId, else from TheSportsDB
const CURATED_HIGHLIGHTS: Record<string, { videoId: string }> = {
  "2391743": { videoId: "kFabAPJP5ys" }, // England vs Croatia 4-2
  "2391742": { videoId: "n3JDGlOwMJ4" }, // France vs Senegal 3-1
};

router.get("/highlights", async (req, res) => {
  try {
    // Get recent finished matches (last 3 days + today)
    const dates: string[] = [];
    const today = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const allEvents: Awaited<ReturnType<typeof getEventsByDay>> = [];
    for (const date of dates) {
      const events = await getEventsByDay(date);
      allEvents.push(...events);
    }

    // Filter to finished or live matches with scores
    const played = allEvents.filter((e) => {
      const status = statusToAppStatus(e.strStatus);
      return status === "finished" || (status === "live" && e.intHomeScore !== null);
    });

    // Deduplicate by event ID
    const seen = new Set<string>();
    const unique = played.filter((e) => {
      if (seen.has(e.idEvent)) return false;
      seen.add(e.idEvent);
      return true;
    });

    // Sort by date descending
    unique.sort((a, b) => b.dateEvent.localeCompare(a.dateEvent));

    const highlights = await Promise.all(
      unique.slice(0, 8).map(async (ev) => {
        // Try to get video from curated list first
        const curated = CURATED_HIGHLIGHTS[ev.idEvent];
        let videoId = curated?.videoId ?? null;

        // Try to get from TheSportsDB event detail if not curated
        if (!videoId) {
          try {
            const detail = await getEventDetail(ev.idEvent);
            if (detail?.strVideo) {
              videoId = extractYouTubeId(detail.strVideo);
            }
          } catch {
            // ignore
          }
        }

        const homeFlag = flagEmoji(ev.strHomeTeam);
        const awayFlag = flagEmoji(ev.strAwayTeam);

        return {
          id: ev.idEvent,
          homeTeam: ev.strHomeTeam,
          awayTeam: ev.strAwayTeam,
          homeFlag,
          awayFlag,
          scoreHome: ev.intHomeScore,
          scoreAway: ev.intAwayScore,
          date: ev.dateEvent,
          group: ev.strGroup,
          status: statusToAppStatus(ev.strStatus),
          videoId,
          // YouTube thumbnail if we have videoId, else TheSportsDB thumb
          thumbnail: videoId
            ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
            : ev.strThumb || null,
          youtubeUrl: videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : `https://www.youtube.com/results?search_query=${encodeURIComponent(
                `${ev.strHomeTeam} ${ev.strAwayTeam} World Cup 2026 highlights`
              )}`,
        };
      })
    );

    res.json(highlights);
  } catch (err) {
    req.log.error({ err }, "getHighlights error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
