import "dotenv/config";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle(process.env.DB_FILE_NAME!, {
  schema: schema,
});

export default db;
