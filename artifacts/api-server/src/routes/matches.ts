import { Router } from "express";
import { db, teamsTable, matchesTable, matchEventsTable, predictionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function teamShape(t: typeof teamsTable.$inferSelect) {
  return { id: t.id, name: t.name, code: t.code, flag: t.flag };
}

router.get("/matches", async (req, res) => {
  try {
    const matches = await db.select().from(matchesTable);
    const teams = await db.select().from(teamsTable);
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    const result = matches.map((m) => ({
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
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "getMatches error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/matches/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, id));
    if (!match) return void res.status(404).json({ error: "Not found" });

    const teams = await db.select().from(teamsTable);
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    const events = await db.select().from(matchEventsTable).where(eq(matchEventsTable.matchId, id));
    const [prediction] = await db.select().from(predictionsTable).where(eq(predictionsTable.matchId, id));

    const stats = [
      { label: "Possession", valueA: "62%", valueB: "38%" },
      { label: "Tirs", valueA: "8", valueB: "5" },
      { label: "Tirs cadrés", valueA: "4", valueB: "2" },
      { label: "Passes", valueA: "487", valueB: "301" },
    ];

    const teamA = teamMap.get(match.teamAId)!;
    const teamB = teamMap.get(match.teamBId)!;

    res.json({
      match: {
        id: match.id,
        teamA: teamShape(teamA),
        teamB: teamShape(teamB),
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        datetime: match.datetime.toISOString(),
        status: match.status,
        group: match.group,
        minute: match.minute,
        stadium: match.stadium,
      },
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        minute: e.minute,
        team: e.team,
        player: e.player,
      })),
      stats,
      userPrediction: prediction
        ? {
            id: prediction.id,
            matchId: prediction.matchId,
            teamA: teamShape(teamA),
            teamB: teamShape(teamB),
            predictedScoreA: prediction.predictedScoreA,
            predictedScoreB: prediction.predictedScoreB,
            pointsEarned: prediction.pointsEarned,
            status: prediction.status,
          }
        : null,
    });
  } catch (err) {
    req.log.error({ err }, "getMatch error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
