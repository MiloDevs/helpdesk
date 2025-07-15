import { sqliteTable, text } from "drizzle-orm/sqlite-core";

const usersTable = sqliteTable("users_table", {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  password: text().notNull(),
  role: text().notNull().default("user"),
});

export default usersTable;
