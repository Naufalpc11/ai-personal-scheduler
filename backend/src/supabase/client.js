const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseClientOptions = {
  auth: { persistSession: false },
  realtime: { transport: WebSocket },
};

const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey,
  supabaseClientOptions
);

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  supabaseClientOptions
);

module.exports = {
  supabaseAuth,
  supabaseAdmin,
};
