import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Function to parse .env.local manually
function getEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  });
  return env;
}

const env = getEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTable() {
  console.log("Inspecting citizen_submissions table schema...");
  
  // Use a raw SQL query via a common RPC if available, or try to select and check the response object
  // Since we might not have a custom RPC, let's try to do a dummy select and then check the 'data' structure
  // if it's empty, we might need another way.
  
  // Better: Query information_schema via a dummy select error or just try to insert a single column and see what it says
  
  // Actually, let's try to query information_schema directly if possible (unlikely via REST)
  // But wait, Supabase REST API doesn't expose information_schema directly.
  
  // Let's try to perform a POST with an empty object and see the error message about missing columns
  const { error } = await supabase
    .from("citizen_submissions")
    .insert({});

  if (error) {
    console.log("Raw Error from insert attempt:");
    console.log(JSON.stringify(error, null, 2));
  } else {
    console.log("Insert success? That's unexpected for an empty object if there are required columns.");
  }
  
  // Also try to select all columns from one row
  const { data: colsData, error: colsError } = await supabase
    .from("citizen_submissions")
    .select("*")
    .limit(1);

  if (colsError) {
    console.error("Select error:", colsError.message);
  } else if (colsData && colsData.length > 0) {
    console.log("Existing columns in table:", Object.keys(colsData[0]));
  } else {
    console.log("Table is empty. Cannot determine columns via SELECT *.");
  }
}

inspectTable();
