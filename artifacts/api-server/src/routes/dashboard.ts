import { Router } from "express";
import { db, predictionsTable, leaguesTable, leagueMembersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getEventsByDay, flagEmoji, statusToAppStatus } from "../services/sportsdb";

const router = Router();

function eventToMatchSummary(ev: Awaited<ReturnType<typeof getEventsByDay>>[0]) {
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

router.get("/dashboard", async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayEvents = await getEventsByDay(todayStr);

    const todayMatches = todayEvents.map(eventToMatchSummary);

    const featured =
      todayMatches.find((m) => m.status === "live") ??
      todayMatches.find((m) => m.status === "upcoming") ??
      todayMatches[0] ??
      null;

    // User predictions from our DB
    const preds = await db
      .select()
      .from(predictionsTable)
      .orderBy(desc(predictionsTable.createdAt))
      .limit(3);

    const predShaped = preds.map((p) => ({
      id: p.id,
      matchId: p.matchId,
      teamA: { id: 0, name: "Team A", code: "TEA", flag: "🏳️" },
      teamB: { id: 0, name: "Team B", code: "TEB", flag: "🏳️" },
      predictedScoreA: p.predictedScoreA,
      predictedScoreB: p.predictedScoreB,
      pointsEarned: p.pointsEarned,
      status: p.status,
    }));

    const leagues = await db.select().from(leaguesTable).limit(1);
    const league = leagues[0];
    let leagueSummary = null;
    if (league) {
      const members = await db
        .select()
        .from(leagueMembersTable)
        .where(eq(leagueMembersTable.leagueId, league.id));
      const me = members.find((m) => m.isCurrentUser);
      leagueSummary = {
        id: league.id,
        name: league.name,
        emoji: league.emoji,
        myRank: me?.rank ?? 1,
        myPoints: me?.points ?? 0,
        memberCount: members.length,
      };
    }

    res.json({
      featuredMatch: featured,
      todayMatches,
      myPredictions: predShaped,
      myLeague: leagueSummary,
    });
  } catch (err) {
    req.log.error({ err }, "getDashboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
