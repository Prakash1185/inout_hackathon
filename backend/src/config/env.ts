import { config } from "dotenv";
import { z } from "zod";

config();

const isProduction = process.env.NODE_ENV === "production";

const defaultMongoUri = "mongodb://127.0.0.1:27017/bitbox";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .default(defaultMongoUri),
  CLIENT_ORIGIN: z.string().default("*"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash-lite"),
  VISION_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment configuration",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

if (!process.env.MONGODB_URI && !isProduction) {
  console.warn(
    `MONGODB_URI not set. Using default local URI: ${defaultMongoUri}`,
  );
}

export const env = parsed.data;
