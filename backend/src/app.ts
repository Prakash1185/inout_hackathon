import cors from "cors";
import express from "express";

import { env } from "./config/env";
import {
    errorMiddleware,
    notFoundMiddleware,
} from "./middlewares/error.middleware";
import { apiRouter } from "./routes";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins = env.CLIENT_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedDevOrigin(origin: string): boolean {
  return (
    /^http:\/\/localhost:\d+$/i.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/i.test(origin) ||
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/i.test(origin)
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        configuredOrigins.includes("*") ||
        configuredOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      if (!isProduction && isAllowedDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };

