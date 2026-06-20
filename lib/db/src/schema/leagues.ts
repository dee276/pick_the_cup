import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaguesTable = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji"),
  inviteCode: text("invite_code").notNull(),
});

export const leagueMembersTable = pgTable("league_members", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").notNull(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  points: integer("points").notNull().default(0),
  change: integer("change").notNull().default(0),
  isCurrentUser: integer("is_current_user").notNull().default(0),
  rank: integer("rank").notNull().default(1),
});

export const insertLeagueSchema = createInsertSchema(leaguesTable).omit({ id: true });
export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type League = typeof leaguesTable.$inferSelect;
