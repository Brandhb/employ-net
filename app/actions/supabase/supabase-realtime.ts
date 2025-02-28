
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

/**
 * Subscribe to Supabase Realtime for any table dynamically
 * @param tableName The name of the table to listen for changes
 * @returns Realtime subscription channel
 */
export async function listenForTableChanges(tableName: string) {
  console.log(`📡 Subscribing to Realtime for table: ${tableName}`);

  const channel = supabaseAdmin
    .channel(`realtime_${tableName}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Track all changes
        schema: "public",
        table: tableName,
      },
      (payload) => {
        console.log(`🔄 Change detected in ${tableName}:`, payload);
        return payload;
      }
    )
    .subscribe();

  return channel;
}
