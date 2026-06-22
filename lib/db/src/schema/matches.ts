import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  teamAId: integer("team_a_id").notNull(),
  teamBId: integer("team_b_id").notNull(),
  scoreA: integer("score_a"),
  scoreB: integer("score_b"),
  datetime: timestamp("datetime", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("upcoming"),
  group: text("group").notNull(),
  minute: integer("minute"),
  stadium: text("stadium"),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({ id: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
