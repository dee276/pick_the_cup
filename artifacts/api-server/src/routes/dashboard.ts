import { Router } from "express";
import { db, teamsTable, matchesTable, predictionsTable, leaguesTable, leagueMembersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function teamShape(t: typeof teamsTable.$inferSelect) {
  return { id: t.id, name: t.name, code: t.code, flag: t.flag };
}

router.get("/dashboard", async (req, res) => {
  try {
    const teams = await db.select().from(teamsTable);
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    const allMatches = await db.select().from(matchesTable);
    const featured = allMatches.find((m) => m.status === "live") ??
      allMatches.find((m) => m.status === "upcoming") ??
      allMatches[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMatches = allMatches.filter(
      (m) => m.datetime >= today && m.datetime < tomorrow
    );

    const preds = await db.select().from(predictionsTable).orderBy(desc(predictionsTable.createdAt)).limit(3);
    const allMatchMap = new Map(allMatches.map((m) => [m.id, m]));

    const predShaped = preds.map((p) => {
      const match = allMatchMap.get(p.matchId)!;
      return {
        id: p.id,
        matchId: p.matchId,
        teamA: teamShape(teamMap.get(match.teamAId)!),
        teamB: teamShape(teamMap.get(match.teamBId)!),
        predictedScoreA: p.predictedScoreA,
        predictedScoreB: p.predictedScoreB,
        pointsEarned: p.pointsEarned,
        status: p.status,
      };
    });

    const leagues = await db.select().from(leaguesTable).limit(1);
    const league = leagues[0];
    let leagueSummary = null;
    if (league) {
      const members = await db.select().from(leagueMembersTable).where(eq(leagueMembersTable.leagueId, league.id));
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

    const matchShape = (m: typeof matchesTable.$inferSelect) => ({
      id: m.id,
      teamA: teamShape(teamMap.get(m.teamAId)!),
      teamB: teamShape(teamMap.get(m.teamBId)!),
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      datetime: m.datetime.toISOString(),
      status: m.status,
      group: m.group,
      minute: m.minute,
      stadium: m.stadium,
    });

    res.json({
      featuredMatch: featured ? matchShape(featured) : null,
      todayMatches: todayMatches.map(matchShape),
      myPredictions: predShaped,
      myLeague: leagueSummary,
    });
  } catch (err) {
    req.log.error({ err }, "getDashboard error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
