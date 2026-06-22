import { Router } from "express";
import { getEventsByDay, getEventDetail, flagEmoji, statusToAppStatus, extractYouTubeId } from "../services/sportsdb";

const router = Router();

function eventToMatch(ev: Awaited<ReturnType<typeof getEventDetail>>) {
  if (!ev) return null;
  return {
    id: parseInt(ev.idEvent, 10),
    teamA: {
      id: parseInt(ev.idHomeTeam, 10),
      name: ev.strHomeTeam,
      code: ev.strHomeTeam.slice(0, 3).toUpperCase(),
      flag: flagEmoji(ev.strHomeTeam),
    },
    teamB: {
      id: parseInt(ev.idAwayTeam, 10),
      name: ev.strAwayTeam,
      code: ev.strAwayTeam.slice(0, 3).toUpperCase(),
      flag: flagEmoji(ev.strAwayTeam),
    },
    scoreA: ev.intHomeScore !== null ? parseInt(ev.intHomeScore, 10) : null,
    scoreB: ev.intAwayScore !== null ? parseInt(ev.intAwayScore, 10) : null,
    datetime: ev.strTimestamp
      ? new Date(ev.strTimestamp).toISOString()
      : new Date(ev.dateEvent).toISOString(),
    status: statusToAppStatus(ev.strStatus),
    group: ev.strGroup ?? "?",
    minute: null,
    stadium: ev.strVenue ?? null,
  };
}

router.get("/matches", async (req, res) => {
  try {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i >= -3; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const allEvents: Awaited<ReturnType<typeof getEventsByDay>> = [];
    for (const date of dates) {
      const events = await getEventsByDay(date);
      allEvents.push(...events);
    }

    const seen = new Set<string>();
    const unique = allEvents.filter((e) => {
      if (seen.has(e.idEvent)) return false;
      seen.add(e.idEvent);
      return true;
    });

    const result = unique.map(eventToMatch).filter(Boolean);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "getMatches error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/matches/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ev = await getEventDetail(id);
    if (!ev) return void res.status(404).json({ error: "Not found" });

    const match = eventToMatch(ev);

    const videoId = extractYouTubeId(ev.strVideo);

    const stats = [
      { label: "Possession", valueA: "55%", valueB: "45%" },
      { label: "Tirs", valueA: "12", valueB: "8" },
      { label: "Tirs cadrés", valueA: "5", valueB: "3" },
      { label: "Passes", valueA: "423", valueB: "341" },
    ];

    res.json({
      match,
      events: [],
      stats,
      userPrediction: null,
      videoId,
      youtubeUrl: videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : null,
    });
  } catch (err) {
    req.log.error({ err }, "getMatch error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
