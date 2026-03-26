import * as fs from 'fs';

async function test() {
  const base64 = Buffer.from("dummy pdf content").toString('base64');
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || ''}`, // Assuming it'll just fail auth if missing, but we want to see payload error
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Test" },
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } }
          ],
        },
      ]
    }),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}
test();
