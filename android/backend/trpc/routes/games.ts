import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../db";

const StatementSchema = z.object({
  id: z.string(),
  text: z.string(),
  isLie: z.boolean(),
});

const RoundSchema = z.object({
  id: z.string(),
  statements: z.array(StatementSchema),
});

const GameSchema = z.object({
  id: z.string(),
  rounds: z.array(RoundSchema),
  authorId: z.string(),
  authorName: z.string(),
  createdAt: z.number(),
  theme: z.string().optional(),
  revealStyle: z.enum(['standard', 'mega']).optional(),
  parentChallengeId: z.string().optional(),
  authorIsPro: z.boolean().optional(),
});

// Helper to transform SurrealDB result to Game object
const transformGame = (record: any): z.infer<typeof GameSchema> => {
  if (!record) throw new Error("Record not found");
  
  // Handle ID: convert RecordId to string if necessary
  let id = record.id;
  if (typeof id === 'object' && id !== null && 'toString' in id) {
    id = id.toString();
  }
  
  // If the ID comes back as "games:uuid", we might want to strip "games:" 
  // depending on how frontend uses it. 
  if (typeof id === 'string' && id.startsWith('games:')) {
    id = id.replace('games:', '');
  }

  return {
    id: id,
    rounds: record.rounds || [],
    authorId: record.authorId || '',
    authorName: record.authorName || 'Unknown',
    createdAt: record.createdAt || Date.now(),
    theme: record.theme,
    revealStyle: record.revealStyle,
    parentChallengeId: record.parentChallengeId,
    authorIsPro: record.authorIsPro,
  };
};

export const gamesRouter = createTRPCRouter({
  create: publicProcedure
    .input(GameSchema)
    .output(GameSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      try {
        const created = await db.create(`games:${input.id}`, input);
        
        // Handle array or single object return from SurrealDB
        const record = Array.isArray(created) ? created[0] : created;
        
        return transformGame(record);
      } catch (e) {
        console.error("Failed to create game:", e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create game',
        });
      }
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(GameSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      try {
        const recordId = input.id.startsWith('games:') ? input.id : `games:${input.id}`;
        const result = await db.select(recordId);
        
        if (!result) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Game with ID ${input.id} not found`,
            });
        }
        
        const record = Array.isArray(result) ? result[0] : result;
        
        if (!record) {
             throw new TRPCError({
                code: 'NOT_FOUND',
                message: `Game with ID ${input.id} not found`,
            });
        }
        
        return transformGame(record);
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        console.error("Failed to get game:", e);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Game with ID ${input.id} not found`,
        });
      }
    }),
});
