import { Router } from "express";
import { db, teamsTable } from "@workspace/db";
import { inArray } from "drizzle-orm";

const router = Router();

router.get("/profile", async (req, res) => {
  try {
    const favoriteTeamIds = [1, 3];
    const favTeams = await db
      .select()
      .from(teamsTable)
      .where(inArray(teamsTable.id, favoriteTeamIds));

    res.json({
      id: 1,
      name: "Dudley Orestil",
      initials: "DO",
      fanSince: 2024,
      location: "Montréal",
      totalPoints: 320,
      predictionAccuracy: 68,
      predictionCount: 12,
      favoriteTeams: favTeams.map((t) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        flag: t.flag,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "getProfile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
