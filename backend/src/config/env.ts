import { config } from "dotenv";
import { z } from "zod";

config();

const isProduction = process.env.NODE_ENV === "production";

const defaultMongoUri = "mongodb://127.0.0.1:27017/bitbox";
const defaultJwtSecret = "dev-only-secret-change-this";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .default(defaultMongoUri),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters")
    .default(defaultJwtSecret),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_ORIGIN: z.string().default("*"),
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

if (!process.env.JWT_SECRET && !isProduction) {
  console.warn(
    "JWT_SECRET not set. Using development fallback secret. Do not use this in production.",
  );
}

if (isProduction && parsed.data.JWT_SECRET === defaultJwtSecret) {
  console.error("Refusing to start in production with default JWT secret.");
  process.exit(1);
}

export const env = parsed.data;
