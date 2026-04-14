import { app } from "./app";
import { env } from "./config/env";
import { connectToDatabase } from "./db/connect";
import { getOrCreateActiveEvent } from "./services/event.service";

async function bootstrap(): Promise<void> {
  await connectToDatabase();
  await getOrCreateActiveEvent();

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
