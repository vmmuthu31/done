import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY!,
  },
  followup: {
    initialDelayMinutes: 120,
    secondDelayMinutes: 480,
    thirdDelayMinutes: 1440,
    maxFollowups: 3,
  },
};
