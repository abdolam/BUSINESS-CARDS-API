const BASE = "https://data.gov.il/api/3/action/datastore_search";
const STREET_RESOURCE = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b"; // רחובות/ישובים
const TTL_MS = 5 * 60 * 1000;

type DsRecord = {
  _id: number;
  סמל_ישוב?: number;
  שם_ישוב?: string;
  סמל_רחוב?: number;
  שם_רחוב?: string;
};

type DsResponse = {
  success: boolean;
  result?: { records?: DsRecord[] };
};

const _cache = new Map<string, { at: number; data: string[] }>();

function normHeb(s: string): string {
  return (s || "").trim().replace(/\s+/g, " ");
}

function urlForCity(city: string): string {
  const u = new URL(BASE);
  u.searchParams.set("resource_id", STREET_RESOURCE);
  u.searchParams.set("q", city);
  return u.toString();
}

/**
 * Fetch all street names for an *exact* Hebrew city name (e.g., "חיפה").
 * Returns unique street names sorted (he locale).
 */
export async function getILStreets(
  city: string,
  signal?: AbortSignal
): Promise<string[]> {
  const key = normHeb(city);
  console.log(city);

  if (!key) return [];
  const now = Date.now();
  const hit = _cache.get(key);
  if (hit && now - hit.at < TTL_MS) return hit.data;

  const res = await fetch(urlForCity(key), { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as DsResponse;
  const rows = json?.result?.records ?? [];

  const exact = rows.filter(
    (r) => normHeb(r["שם_ישוב"] || "") === key && r["שם_רחוב"]
  );

  // Deduplicate by name (keep Hebrew names)
  const map = new Map<string, string>();
  for (const r of exact) {
    const name = normHeb(String(r["שם_רחוב"]));
    if (name) map.set(name, name);
  }
  const list = Array.from(map.values()).sort((a, b) =>
    a.localeCompare(b, "he")
  );

  _cache.set(key, { at: now, data: list });
  return list;
}

export default { getILStreets };
