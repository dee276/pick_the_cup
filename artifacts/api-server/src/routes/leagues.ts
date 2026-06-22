import { Router } from "express";
import { db, leaguesTable, leagueMembersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/leagues", async (req, res) => {
  try {
    const leagues = await db.select().from(leaguesTable);
    const members = await db.select().from(leagueMembersTable);

    const result = leagues.map((l) => {
      const leagueMembers = members.filter((m) => m.leagueId === l.id);
      const me = leagueMembers.find((m) => m.isCurrentUser);
      return {
        id: l.id,
        name: l.name,
        emoji: l.emoji,
        memberCount: leagueMembers.length,
        myRank: me?.rank ?? 1,
        myPoints: me?.points ?? 0,
        inviteCode: l.inviteCode,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "getLeagues error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leagues/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [league] = await db.select().from(leaguesTable).where(eq(leaguesTable.id, id));
    if (!league) return void res.status(404).json({ error: "Not found" });

    const members = await db
      .select()
      .from(leagueMembersTable)
      .where(eq(leagueMembersTable.leagueId, id));

    members.sort((a, b) => b.points - a.points);
    members.forEach((m, i) => { m.rank = i + 1; });

    const me = members.find((m) => m.isCurrentUser);

    res.json({
      id: league.id,
      name: league.name,
      emoji: league.emoji,
      memberCount: members.length,
      myRank: me?.rank ?? 1,
      myPoints: me?.points ?? 0,
      inviteCode: league.inviteCode,
      members: members.map((m) => ({
        rank: m.rank,
        name: m.name,
        initials: m.initials,
        points: m.points,
        change: m.change,
        isCurrentUser: m.isCurrentUser === 1,
      })),
      badges: ["Leader", "Précision"],
    });
  } catch (err) {
    req.log.error({ err }, "getLeague error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
