import { relations } from "drizzle-orm";
import issuesModel from "./issues.model.js";
import usersModel from "./users.model.js";

export const usersRelation = relations(usersModel, ({ many }) => ({
  issues: many(issuesModel),
}));

export const issuesRelation = relations(issuesModel, ({ one }) => ({
  assignee: one(usersModel, {
    fields: [issuesModel.assigneeId],
    references: [usersModel.id],
  }),
}));
