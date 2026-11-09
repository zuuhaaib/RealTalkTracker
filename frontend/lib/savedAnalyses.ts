import type { AnalyzeResponse } from "../types/analysis";
import { byMessages } from "./edition";
import { getBrowserSupabase } from "./supabase/client";

// Results people chose to keep, stored on their account in Supabase. Row
// level security on the saved_analyses table is what limits every query
// to the signed-in owner.

export const MAX_SAVED = 20;

const TABLE = "saved_analyses";
const MAX_TITLE = 200;

export type SavedSummary = {
  id: string;
  title: string;
  platform: AnalyzeResponse["platform"];
  message_count: number;
  created_at: string;
};

export class SaveError extends Error {
  constructor(public reason: "limit" | "failed") {
    super(reason);
  }
}

function client() {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new SaveError("failed");
  return supabase;
}

function savedTitle(data: AnalyzeResponse) {
  const names = byMessages(data).map(([name]) => name);
  const title = names.length <= 3 ? names.join(" & ") : `${names.slice(0, 2).join(", ")} & ${names.length - 2} more`;

  return title.slice(0, MAX_TITLE) || "a chat";
}

export async function saveAnalysis(data: AnalyzeResponse) {
  const { error } = await client().from(TABLE).insert({
    title: savedTitle(data),
    platform: data.platform,
    message_count: data.messageCount,
    result: data,
  });

  if (error) {
    // The insert rule refuses a 21st save with a permission error.
    throw new SaveError(error.code === "42501" ? "limit" : "failed");
  }
}

export async function listSaved(): Promise<SavedSummary[]> {
  const { data, error } = await client()
    .from(TABLE)
    .select("id, title, platform, message_count, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new SaveError("failed");
  return data as SavedSummary[];
}

export async function loadSaved(id: string): Promise<AnalyzeResponse> {
  const { data, error } = await client().from(TABLE).select("result").eq("id", id).single();

  if (error) throw new SaveError("failed");
  return (data as { result: AnalyzeResponse }).result;
}

export async function deleteSaved(id: string) {
  const { error } = await client().from(TABLE).delete().eq("id", id);

  if (error) throw new SaveError("failed");
}
