import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ouqfgqwesqrewdchcwwb.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_kr5xL4w58XScZhuIegrA_Q_oZhhCya4";

let supabaseClient = null;
if (SUPABASE_URL.includes("supabase.co")) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
}

export { supabaseClient, SUPABASE_URL, SUPABASE_KEY };
