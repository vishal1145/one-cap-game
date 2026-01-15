import { createTRPCRouter } from "./create-context";
import { gamesRouter } from "./routes/games";

export const appRouter = createTRPCRouter({
  games: gamesRouter,
});

export type AppRouter = typeof appRouter;
