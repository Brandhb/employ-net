import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE! ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

/**
 * Subscribe to Supabase Realtime for any table dynamically
 * @param tableName The name of the table to listen for changes
 * @param callback Function to handle the update
 * @returns Function to unsubscribe
 */
export async function listenForTableChanges(
  tableName: string,
  columnName: string,
  value: string,
  callback: (payload: any) => void
) {
  console.log(`📡 Subscribing to Realtime for table: ${tableName}`);

  const channel = supabase
    .channel(`realtime_${tableName}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: tableName,
        filter: `${columnName || ""}=eq.${value || ""}`,
      },
      callback
    )
    .subscribe();

  return () => {
    console.log(`🛑 Unsubscribing from Realtime for table: ${tableName}`);
    channel.unsubscribe();
  };
}
