import "dotenv/config";
import * as schema from "../models/schema.js";
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle(process.env.DB_FILE_NAME, {
  schema: schema,
});

export default db;
