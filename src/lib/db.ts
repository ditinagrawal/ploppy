import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as settingsSchema from "@/model/settings.model";
import * as chatbotSchema from "@/model/chatbot.model";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { ...settingsSchema, ...chatbotSchema } });

export default db;
