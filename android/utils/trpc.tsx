import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  // If we are in the browser, we can use a relative path
  if (typeof window !== 'undefined') return '';

  if (!url) {
    // Fallback for development if needed, or throw error
    console.warn("EXPO_PUBLIC_RORK_API_BASE_URL not set. Calls might fail on device.");
    return ""; 
  }

  return url;
};

// for direct queries
export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
