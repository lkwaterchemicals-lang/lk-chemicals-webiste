// Minimal Firestore REST reader for the server.
//
// Route loaders and the sitemap run on the server, where the catalog (which
// lives only in Firestore) is needed to emit real <title> / og:image tags and
// sitemap entries for crawlers that never execute JavaScript. The web SDK is
// built for the browser, so on the server we read documents over Firestore's
// public REST API instead (same public project config, same security rules).
import { firebaseConfig } from "@/integrations/firebase/config";

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

type FsValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
};

function decodeValue(v: FsValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.arrayValue) return (v.arrayValue.values ?? []).map(decodeValue);
  if (v.mapValue) return decodeFields(v.mapValue.fields);
  return null;
}

function decodeFields(fields?: Record<string, FsValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields ?? {}).map(([k, v]) => [k, decodeValue(v)]));
}

const isLive = (d: Record<string, unknown>) => d.status !== "draft" && d.status !== "archived";

/** Fetch one published document (or null — never throws). */
export async function fetchDocRest(
  collection: string,
  id: string,
  timeoutMs = 2500,
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
      `${BASE}/${collection}/${encodeURIComponent(id)}?key=${firebaseConfig.apiKey}`,
      { signal: AbortSignal.timeout(timeoutMs) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { fields?: Record<string, FsValue> };
    const doc = decodeFields(json.fields);
    return isLive(doc) ? doc : null;
  } catch {
    return null;
  }
}

/** List a collection's published documents (empty array on any failure). */
export async function listDocsRest(
  collection: string,
  pageSize = 300,
  timeoutMs = 4000,
): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(
      `${BASE}/${collection}?pageSize=${pageSize}&key=${firebaseConfig.apiKey}`,
      {
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      documents?: { name: string; fields?: Record<string, FsValue> }[];
    };
    return (json.documents ?? [])
      .map((d) => ({ __id: d.name.split("/").pop() ?? "", ...decodeFields(d.fields) }))
      .filter(isLive);
  } catch {
    return [];
  }
}
