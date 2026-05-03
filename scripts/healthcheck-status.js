const DEFAULT_URL = "http://127.0.0.1:5000/api/v1/status";
const DEFAULT_COMPONENTS = ["web-database", "web-scraper", "web-components", "web-server"];

function getExpectedComponents() {
  if (!process.env.HEALTHCHECK_COMPONENTS) {
    return DEFAULT_COMPONENTS;
  }

  return process.env.HEALTHCHECK_COMPONENTS.split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

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

  if (!Array.isArray(payload) || payload.length === 0) {
    process.stderr.write("Healthcheck response is empty or not an array\n");
    process.exit(1);
  }

  const expectedComponents = getExpectedComponents();
  const componentStatus = new Map(
    payload.map((entry) => [String(entry?.name ?? "").trim(), String(entry?.status ?? "").trim()]),
  );

  const missingComponents = expectedComponents.filter((name) => !componentStatus.has(name));
  if (missingComponents.length > 0) {
    process.stderr.write(`Healthcheck missing expected components: ${missingComponents.join(", ")}\n`);
    process.exit(1);
  }

  const notRunningComponents = expectedComponents.filter((name) => componentStatus.get(name) !== "running");
  if (notRunningComponents.length > 0) {
    process.stderr.write(`Healthcheck components not running: ${notRunningComponents.join(", ")}\n`);
    process.exit(1);
  }
}

main().catch((error) => {
  process.stderr.write(`Healthcheck unexpected error: ${error.message}\n`);
  process.exit(1);
});