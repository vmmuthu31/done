import { DoneAgent } from "./agent";

const agent = new DoneAgent();

const shutdown = async () => {
  await agent.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

agent.start().catch((error) => {
  console.error("Failed to start agent:", error);
  process.exit(1);
});
