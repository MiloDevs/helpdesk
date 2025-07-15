import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const issuesTable = sqliteTable("issues_table", {
  id: text().primaryKey(),
  reporterName: text().notNull(),
  officeNumber: int().notNull(),
  issueDescription: text().notNull(),
  status: text().notNull().default("pending"),
  assigneeId: text("assignee_id"),
});

export default issuesTable;
