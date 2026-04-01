import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function getEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
  return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testInsert() {
  console.log("Testing insert into citizen_submissions...");
  
  // 1. Create a dummy form response first (to satisfy potential FK)
  const respId = "test-resp-" + Date.now();
  console.log("Inserting dummy response:", respId);
  const { error: err1 } = await supabase.from('form_responses').insert({
    id: respId,
    form_id: 'form-001',
    form_name: 'Test Form',
    tramite_code: 'TEST-' + Date.now(),
    citizen_name: 'Test User',
    data: {}
  });

  if (err1) {
    console.error("❌ Failed to insert dummy response:", err1);
    process.exit(1);
  }

  // 2. Try to insert into citizen_submissions
  console.log("Inserting into citizen_submissions...");
  const { data, error: err2 } = await supabase.from('citizen_submissions').insert({
    citizen_name: 'Test User',
    form_id: 'form-001',
    form_name: 'Test Form',
    tramite_code: 'TEST-CODE',
    email: 'test@example.com',
    response_id: respId
  }).select();

  if (err2) {
    console.error("❌ FAILED to insert into citizen_submissions:");
    console.error(JSON.stringify(err2, null, 2));
  } else {
    console.log("✅ SUCCESS! Inserted:", data);
  }
  
  // Cleanup
  await supabase.from('form_responses').delete().eq('id', respId);
}

testInsert();
