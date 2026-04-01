import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTable() {
  console.log("Checking citizen_submissions table...");
  const { data, error } = await supabase
    .from("citizen_submissions")
    .select("*")
    .limit(1);

  if (error) {
    console.error("❌ Error accessing citizen_submissions:", error.message);
    if (error.message.includes('relation "public.citizen_submissions" does not exist')) {
      console.log("💡 The table REALLY does not exist.");
    }
  } else {
    console.log("✅ Table exists. Found entries:", data.length);
  }
}

testTable();
