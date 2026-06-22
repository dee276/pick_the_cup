import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { userPreferences, userInteractions } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = auth.userId;
  next();
}

router.get("/preferences", requireAuth, async (req: any, res) => {
  try {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, req.userId));

    if (!prefs) {
      return res.json({
        favoriteTeams: [],
        teamScores: {},
        highlightViews: {},
        groupInterests: {},
        totalInteractions: 0,
        recommendations: [],
      });
    }

    const teams = prefs.teamScores as Record<string, number> ?? {};
    const recommendations = Object.entries(teams)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([team]) => team);

    res.json({
      favoriteTeams: prefs.favoriteTeams ?? [],
      teamScores: prefs.teamScores ?? {},
      highlightViews: prefs.highlightViews ?? {},
      groupInterests: prefs.groupInterests ?? {},
      totalInteractions: prefs.totalInteractions ?? 0,
      recommendations,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

router.post("/interactions", requireAuth, async (req: any, res) => {
  const { entityType, entityId, action, metadata } = req.body;
  if (!entityType || !entityId || !action) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.insert(userInteractions).values({
      userId: req.userId,
      entityType,
      entityId,
      action,
      metadata: metadata ?? {},
    });

    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, req.userId));

    const teamScores = (existing?.teamScores as Record<string, number>) ?? {};
    const highlightViews = (existing?.highlightViews as Record<string, number>) ?? {};
    const groupInterests = (existing?.groupInterests as Record<string, number>) ?? {};
    const total = (existing?.totalInteractions ?? 0) + 1;

    const WEIGHTS: Record<string, number> = {
      view: 1,
      predict: 3,
      watch_highlight: 2,
      favorite: 5,
    };
    const weight = WEIGHTS[action] ?? 1;

    if (entityType === "team") {
      teamScores[entityId] = (teamScores[entityId] ?? 0) + weight;
    }
    if (entityType === "highlight") {
      highlightViews[entityId] = (highlightViews[entityId] ?? 0) + weight;
      if (metadata?.team) {
        teamScores[metadata.team as string] = (teamScores[metadata.team as string] ?? 0) + 1;
      }
    }
    if (entityType === "match") {
      if (metadata?.group) {
        groupInterests[metadata.group as string] = (groupInterests[metadata.group as string] ?? 0) + weight;
      }
      if (metadata?.homeTeam) {
        teamScores[metadata.homeTeam as string] = (teamScores[metadata.homeTeam as string] ?? 0) + Math.ceil(weight / 2);
      }
      if (metadata?.awayTeam) {
        teamScores[metadata.awayTeam as string] = (teamScores[metadata.awayTeam as string] ?? 0) + Math.ceil(weight / 2);
      }
    }

    if (existing) {
      await db
        .update(userPreferences)
        .set({ teamScores, highlightViews, groupInterests, totalInteractions: total, updatedAt: new Date() })
        .where(eq(userPreferences.userId, req.userId));
    } else {
      await db.insert(userPreferences).values({
        userId: req.userId,
        teamScores,
        highlightViews,
        groupInterests,
        totalInteractions: total,
        favoriteTeams: [],
      });
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to record interaction" });
  }
});

router.post("/preferences/favorite-teams", requireAuth, async (req: any, res) => {
  const { teams } = req.body;
  if (!Array.isArray(teams)) return res.status(400).json({ error: "teams must be array" });

  try {
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, req.userId));

    const teamScores = (existing?.teamScores as Record<string, number>) ?? {};
    for (const t of teams) {
      teamScores[t] = (teamScores[t] ?? 0) + 5;
    }

    if (existing) {
      await db
        .update(userPreferences)
        .set({ favoriteTeams: teams, teamScores, updatedAt: new Date() })
        .where(eq(userPreferences.userId, req.userId));
    } else {
      await db.insert(userPreferences).values({
        userId: req.userId,
        favoriteTeams: teams,
        teamScores,
        highlightViews: {},
        groupInterests: {},
        totalInteractions: 0,
      });
    }

    res.json({ ok: true, favoriteTeams: teams });
  } catch (e) {
    res.status(500).json({ error: "Failed to update favorite teams" });
  }
});

export default router;
