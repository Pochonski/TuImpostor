const SUPABASE_URL = "https://ouqfgqwesqrewdchcwwb.supabase.co";
const SUPABASE_KEY = "sb_publishable_kr5xL4w58XScZhuIegrA_Q_oZhhCya4";

let supabaseClient = null;
if (typeof window !== "undefined" && typeof window.supabase !== "undefined" && SUPABASE_URL.includes("supabase.co")) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

export { supabaseClient, SUPABASE_URL, SUPABASE_KEY };
