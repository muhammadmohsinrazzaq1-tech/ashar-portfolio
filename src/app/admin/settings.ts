import { createServerSupabaseClient } from "@/lib/supabase";

/**
 * Reads site_settings keys, falling back to provided defaults
 * (typically seed values from content.ts) when a key is missing.
 */
export async function getSiteSettings(
  keys: string[],
  defaults: Record<string, string> = {}
): Promise<Record<string, string>> {
  const values: Record<string, string> = { ...defaults };
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", keys);
    for (const row of data ?? []) {
      if (typeof row.value === "string") values[row.key] = row.value;
    }
  } catch {
    // Fall through to defaults.
  }
  return values;
}
