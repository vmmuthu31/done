import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL ?? "",
    anonKey: process.env.SUPABASE_ANON_KEY ?? "",
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY ?? "",
  },
  followup: {
    initialDelayMinutes: 120,
    secondDelayMinutes: 480,
    thirdDelayMinutes: 1440,
    maxFollowups: 3,
  },
};

export function validateConfig() {
  const missing: string[] = [];
  if (!config.supabase.url) missing.push("SUPABASE_URL");
  if (!config.supabase.anonKey) missing.push("SUPABASE_ANON_KEY");
  if (!config.groq.apiKey) missing.push("GROQ_API_KEY");
  return missing;
}
