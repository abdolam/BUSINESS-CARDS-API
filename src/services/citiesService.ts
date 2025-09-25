// Fetch & cache Israel city names (שם_ישוב)
const BASE = "https://data.gov.il/api/3/action/datastore_search";
const CITY_RESOURCE = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

type DsRecord = { שם_ישוב?: string };
type DsResponse = { success: boolean; result?: { records?: DsRecord[] } };

let cache: { at: number; data: string[] } | null = null;

const normHeb = (s: string) => (s || "").replace(/\s+/g, " ").trim();

export async function getILCities(): Promise<string[]> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.data;

  const u = new URL(BASE);
  u.searchParams.set("resource_id", CITY_RESOURCE);
  u.searchParams.set("fields", "שם_ישוב");
  u.searchParams.set("limit", "32000");

  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = (await res.json()) as DsResponse;
  const rows = json?.result?.records ?? [];

  const uniq = new Map<string, string>();
  for (const r of rows) {
    const name = normHeb(String(r["שם_ישוב"] || ""));
    if (name) uniq.set(name, name);
  }
  const list = Array.from(uniq.values()).sort((a, b) =>
    a.localeCompare(b, "he")
  );
  cache = { at: now, data: list };
  return list;
}

export default { getILCities };
