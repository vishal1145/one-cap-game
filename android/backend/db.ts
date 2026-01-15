import { Surreal } from 'surrealdb';

const db = new Surreal();

let initialized = false;

export const getDb = async () => {
  if (initialized) return db;

  try {
    await db.connect(process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT!, {
      namespace: process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE!,
      database: 'rork', // Default database name
    });
    
    // Authenticate with token if provided
    if (process.env.EXPO_PUBLIC_RORK_DB_TOKEN) {
        await db.authenticate(process.env.EXPO_PUBLIC_RORK_DB_TOKEN);
    }
    
    initialized = true;
    return db;
  } catch (err) {
    console.error('Failed to connect to SurrealDB:', err);
    throw err;
  }
};
