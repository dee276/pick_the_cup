import { Router } from "express";
import { db, teamsTable, matchesTable } from "@workspace/db";

const router = Router();

const GROUPS = ["A", "B", "C", "D", "E", "F"];

const KEY_SCENARIOS: Record<string, string> = {
  A: "Si Allemagne gagne, elle est qualifiée. Si Écosse bat Suisse, 3 équipes à égalité.",
  B: "Espagne déjà qualifiée. Croatie vs Albanie décisif pour la 2e place.",
  C: "Angleterre qualifiée. Danemark et Slovénie se disputent la 2e place.",
  D: "France qualifiée. Les Pays-Bas doivent battre l'Autriche pour passer.",
  E: "Belgique en danger. Si Roumanie gagne et Belgique perd, élimination.",
  F: "Si Belgique bat Croatie, elle est qualifiée. Si Canada gagne, Belgique éliminée.",
};

router.get("/standings", async (req, res) => {
  try {
    const teams = await db.select().from(teamsTable);
    const matches = await db.select().from(matchesTable);

    const groupFilter = req.query.group as string | undefined;
    const groups = groupFilter ? [groupFilter.toUpperCase()] : GROUPS;

    const result = groups
      .map((group) => {
        const groupTeams = teams.filter((t) => t.group === group);
        const groupMatches = matches.filter(
          (m) => m.group === group && m.status === "finished"
        );

        const standings = groupTeams.map((team) => {
          let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;

          for (const match of groupMatches) {
            const isA = match.teamAId === team.id;
            const isB = match.teamBId === team.id;
            if (!isA && !isB) continue;

            played++;
            const sa = match.scoreA ?? 0;
            const sb = match.scoreB ?? 0;
            const myScore = isA ? sa : sb;
            const oppScore = isA ? sb : sa;
            gf += myScore;
            ga += oppScore;
            if (myScore > oppScore) won++;
            else if (myScore === oppScore) drawn++;
            else lost++;
          }

          const pts = won * 3 + drawn;
          const gd = gf - ga;

          let status: "qualified" | "danger" | "eliminated" | "pending" = "pending";
          if (pts >= 6) status = "qualified";
          else if (pts <= 1 && played >= 2) status = "danger";

          return {
            team: { id: team.id, name: team.name, code: team.code, flag: team.flag },
            played,
            won,
            drawn,
            lost,
            goalsFor: gf,
            goalsAgainst: ga,
            goalDiff: gd,
            points: pts,
            status,
          };
        });

        standings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
          return b.goalsFor - a.goalsFor;
        });

        return {
          group,
          teams: standings,
          keyScenario: KEY_SCENARIOS[group] ?? null,
        };
      });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "getStandings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
