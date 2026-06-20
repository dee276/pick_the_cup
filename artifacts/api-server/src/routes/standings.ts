import { Router } from "express";
import { getStandings, flagEmoji } from "../services/sportsdb";

const router = Router();

const GROUP_SCENARIOS: Record<string, string> = {
  "Group A": "Mexico déjà qualifié avec 6 pts. Deuxième place entre les autres équipes.",
  "Group B": "Canada en tête avec 4 pts. Reste à jouer pour la 2e place.",
  "Group C": "Scotland et Brazil se disputent la tête du groupe.",
  "Group D": "USA en tête. Les autres équipes doivent encore se battre.",
  "Group E": "Germany en tête après leur victoire 7-1.",
  "Group F": "Groupe très serré — chaque point compte.",
  "Group G": "Belgium doit réagir après le match nul 1-1.",
  "Group H": "Groupe encore indécis — tous les scénarios possibles.",
  "Group I": "Norway débute bien sa compétition.",
  "Group J": "Argentina déjà forte avec 3-0 contre Algérie.",
  "Group K": "Groupe en cours de formation.",
  "Group L": "England domine avec 4-2 contre Croatia.",
};

router.get("/standings", async (req, res) => {
  try {
    const standings = await getStandings();
    const groupFilter = req.query.group as string | undefined;

    // Group by strGroup
    const byGroup = new Map<string, typeof standings>();
    for (const s of standings) {
      const key = s.strGroup;
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)!.push(s);
    }

    let groups = Array.from(byGroup.entries()).map(([group, teams]) => {
      const sorted = [...teams].sort(
        (a, b) => parseInt(b.intPoints) - parseInt(a.intPoints)
      );
      return {
        group: group.replace("Group ", ""),
        teams: sorted.map((t) => {
          const pts = parseInt(t.intPoints);
          const gd = parseInt(t.intGoalDifference);
          let status: "qualified" | "danger" | "eliminated" | "pending" = "pending";
          if (pts >= 6) status = "qualified";
          else if (pts <= 1 && parseInt(t.intPlayed) >= 2) status = "danger";
          return {
            team: {
              id: parseInt(t.idTeam),
              name: t.strTeam,
              code: t.strTeam.slice(0, 3).toUpperCase(),
              flag: flagEmoji(t.strTeam),
            },
            played: parseInt(t.intPlayed),
            won: parseInt(t.intWin),
            drawn: parseInt(t.intDraw),
            lost: parseInt(t.intLoss),
            goalsFor: parseInt(t.intGoalsFor),
            goalsAgainst: parseInt(t.intGoalsAgainst),
            goalDiff: gd,
            points: pts,
            status,
          };
        }),
        keyScenario: GROUP_SCENARIOS[group] ?? null,
      };
    });

    if (groupFilter) {
      groups = groups.filter(
        (g) => g.group.toUpperCase() === groupFilter.toUpperCase()
      );
    }

    // If API returns limited data, return what we have
    res.json(groups);
  } catch (err) {
    req.log.error({ err }, "getStandings error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
