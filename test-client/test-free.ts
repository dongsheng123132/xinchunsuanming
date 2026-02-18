/**
 * Simple test: call the free (no payment) endpoint to verify server works.
 */

// Bypass local proxy for localhost requests
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

async function main() {
  const SERVER_URL = process.env.SERVER_URL || "http://localhost:4021";

  console.log(`Testing free endpoint at ${SERVER_URL}...\n`);

  const response = await fetch(`${SERVER_URL}/api/fortune/interpret-free`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stickNumbers: [42, 17, 88],
      category: "career",
      language: "zh-CN",
    }),
  });

  const result = await response.json();
  console.log("Result:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
