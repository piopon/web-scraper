const DEFAULT_URL = "http://127.0.0.1:5000/api/v1/status";

async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    process.stderr.write(`Healthcheck request failed: ${error.message}\n`);
    process.exit(1);
  }

  if (!response.ok) {
    process.stderr.write(`Healthcheck failed with status ${response.status}\n`);
    process.exit(1);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    process.stderr.write(`Healthcheck invalid JSON response: ${error.message}\n`);
    process.exit(1);
  }

  const isHealthy = Array.isArray(payload) && payload.length > 0 && payload.every((entry) => entry?.status === "running");
  if (!isHealthy) {
    process.stderr.write("Healthcheck detected non-running component status\n");
    process.exit(1);
  }
}

main().catch((error) => {
  process.stderr.write(`Healthcheck unexpected error: ${error.message}\n`);
  process.exit(1);
});