import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import crypto from "crypto";

export const usersTable = sqliteTable("users_table", {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  password: text().notNull(),
});

export const issuesTable = sqliteTable("issues_table", {
  id: text().primaryKey(),
  reporterName: text().notNull(),
  officeNumber: int().notNull(),
  issueDescription: text().notNull(),
  status: text().notNull().default("pending"),
  assigneeId: text("assignee_id"),
});

export const assigneesRelation = relations(usersTable, ({ many }) => ({
  issues: many(issuesTable),
}));

export const issuesRelation = relations(issuesTable, ({ one }) => ({
  assignee: one(usersTable, {
    fields: [issuesTable.assigneeId],
    references: [usersTable.id],
  }),
}));
