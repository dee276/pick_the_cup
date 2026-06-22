import { Router } from "express";
import { db, predictionsTable, matchesTable, teamsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePredictionBody } from "@workspace/api-zod";

const router = Router();

function teamShape(t: typeof teamsTable.$inferSelect) {
  return { id: t.id, name: t.name, code: t.code, flag: t.flag };
}

router.get("/predictions", async (req, res) => {
  try {
    const preds = await db.select().from(predictionsTable);
    const teams = await db.select().from(teamsTable);
    const matches = await db.select().from(matchesTable);

    const teamMap = new Map(teams.map((t) => [t.id, t]));
    const matchMap = new Map(matches.map((m) => [m.id, m]));

    const result = preds.map((p) => {
      const match = matchMap.get(p.matchId)!;
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

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "getPredictions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/predictions", async (req, res) => {
  try {
    const parsed = CreatePredictionBody.safeParse(req.body);
    if (!parsed.success) {
      return void res.status(400).json({ error: "Invalid input" });
    }

    const { matchId, predictedScoreA, predictedScoreB } = parsed.data;

    const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId));
    if (!match) return void res.status(400).json({ error: "Match not found" });

    const teams = await db.select().from(teamsTable);
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    const [existing] = await db
      .select()
      .from(predictionsTable)
      .where(eq(predictionsTable.matchId, matchId));

    let prediction;
    if (existing) {
      const [updated] = await db
        .update(predictionsTable)
        .set({ predictedScoreA, predictedScoreB })
        .where(eq(predictionsTable.matchId, matchId))
        .returning();
      prediction = updated;
    } else {
      const [created] = await db
        .insert(predictionsTable)
        .values({ matchId, predictedScoreA, predictedScoreB, status: "pending" })
        .returning();
      prediction = created;
    }

    res.status(201).json({
      id: prediction.id,
      matchId: prediction.matchId,
      teamA: teamShape(teamMap.get(match.teamAId)!),
      teamB: teamShape(teamMap.get(match.teamBId)!),
      predictedScoreA: prediction.predictedScoreA,
      predictedScoreB: prediction.predictedScoreB,
      pointsEarned: prediction.pointsEarned,
      status: prediction.status,
    });
  } catch (err) {
    req.log.error({ err }, "createPrediction error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
