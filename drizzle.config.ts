import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/model/settings.model.ts", "./src/model/chatbot.model.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
