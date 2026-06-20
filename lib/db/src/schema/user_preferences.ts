import { pgTable, text, jsonb, timestamp, integer, serial } from "drizzle-orm/pg-core";

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  favoriteTeams: jsonb("favorite_teams").$type<string[]>().default([]),
  teamScores: jsonb("team_scores").$type<Record<string, number>>().default({}),
  highlightViews: jsonb("highlight_views").$type<Record<string, number>>().default({}),
  groupInterests: jsonb("group_interests").$type<Record<string, number>>().default({}),
  totalInteractions: integer("total_interactions").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});
