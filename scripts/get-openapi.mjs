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
const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;

async function getOpenApi() {
  const res = await fetch(url);
  const data = await res.json();
  const citizenSub = data.definitions.citizen_submissions;
  const formResp = data.definitions.form_responses;
  
  console.log("citizen_submissions schema:");
  console.log(JSON.stringify(citizenSub.properties, null, 2));
  
  console.log("\nform_responses schema:");
  console.log(JSON.stringify(formResp.properties, null, 2));
}

getOpenApi();
