import app from "./app";
import { logger } from "./lib/logger";
import { seedAdmin, seedVideos } from "./lib/seed";
import { backfillVideoTranslations } from "./routes/videos";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

seedAdmin().catch((err) => logger.error({ err }, "Seed failed"));

seedVideos()
  .then(() => backfillVideoTranslations())
  .catch((err) =>
    logger.warn({ err }, "Video seed/translation failed (non-critical)")
  );

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
