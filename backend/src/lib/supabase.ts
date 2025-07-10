import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { Database } from "../utils/database.types";
// This function should only be used in server components or route handlers
export function createServerSupabaseClient(request?: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "Supabase credentials are not set in environment variables"
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Get Clerk token if request is available
        fetch: async (url, options = {}) => {
          const clerkToken = request
            ? await getAuth(request).getToken({ template: "supabase" })
            : null;

          // Set headers with authorization if token exists
          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set("Authorization", `Bearer ${clerkToken}`);
          }

          // Now call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}
