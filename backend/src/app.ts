import cors from "cors";
import express from "express";

import { env } from "./config/env";
import {
    errorMiddleware,
    notFoundMiddleware,
} from "./middlewares/error.middleware";
import { apiRouter } from "./routes";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };

