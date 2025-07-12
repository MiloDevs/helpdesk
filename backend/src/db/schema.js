import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: text().primaryKey(),
  name: text().notNull().unique(),
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
