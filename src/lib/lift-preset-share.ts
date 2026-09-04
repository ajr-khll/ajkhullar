import { createClient } from "@supabase/supabase-js";

export type PresetSharePreview = {
  name: string;
  exerciseNames: string[];
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function getPresetSharePreview(
  shareId: string,
): Promise<PresetSharePreview | null> {
  if (!isUuid(shareId)) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("get_preset_share", {
    share_id: shareId.toLowerCase(),
  });
  if (error) return null;

  const row = Array.isArray(data) ? data[0] : data;
  const snapshot = row?.snapshot as { name?: unknown; exercises?: unknown } | undefined;
  if (typeof snapshot?.name !== "string" || !Array.isArray(snapshot.exercises)) {
    return null;
  }

  return {
    name: snapshot.name,
    exerciseNames: snapshot.exercises
      .map((exercise) => (exercise as { name?: unknown })?.name)
      .filter((name): name is string => typeof name === "string"),
  };
}
