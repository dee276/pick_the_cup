import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const matchEventsTable = pgTable("match_events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  type: text("type").notNull(),
  minute: integer("minute").notNull(),
  team: text("team").notNull(),
  player: text("player").notNull(),
});

export const insertMatchEventSchema = createInsertSchema(matchEventsTable).omit({ id: true });
export type InsertMatchEvent = z.infer<typeof insertMatchEventSchema>;
export type MatchEvent = typeof matchEventsTable.$inferSelect;
