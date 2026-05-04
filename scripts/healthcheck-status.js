const DEFAULT_URL = "http://127.0.0.1:5000/api/v1/status";
const DEFAULT_COMPONENT_STATES = {
  "web-database": ["running"],
  "web-scraper": ["running", "stopped"],
  "web-components": ["running"],
  "web-server": ["running"],
};

function normalizeStateMap(stateMap) {
  const normalizedMap = {};
  for (const [componentName, acceptedStates] of Object.entries(stateMap)) {
    const normalizedName = String(componentName).trim();
    if (normalizedName.length === 0) {
      continue;
    }
    const normalizedStates = Array.isArray(acceptedStates)
      ? acceptedStates.map((state) => String(state).trim().toLowerCase()).filter((state) => state.length > 0)
      : [];
    if (normalizedStates.length === 0) {
      continue;
    }
    normalizedMap[normalizedName] = normalizedStates;
  }
  return normalizedMap;
}

function getExpectedComponentStates() {
  if (!process.env.HEALTHCHECK_COMPONENT_STATES) {
    return normalizeStateMap(DEFAULT_COMPONENT_STATES);
  }

  let parsedMap;
  try {
    parsedMap = JSON.parse(process.env.HEALTHCHECK_COMPONENT_STATES);
  } catch (error) {
    throw new Error(`Invalid HEALTHCHECK_COMPONENT_STATES JSON: ${error.message}`);
  }

  if (parsedMap == null || typeof parsedMap !== "object" || Array.isArray(parsedMap)) {
    throw new Error("HEALTHCHECK_COMPONENT_STATES must be a JSON object");
  }

  const normalizedMap = normalizeStateMap(parsedMap);
  if (Object.keys(normalizedMap).length === 0) {
    throw new Error("HEALTHCHECK_COMPONENT_STATES must define at least one component with accepted states");
  }
  return normalizedMap;
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

  const expectedComponentStates = getExpectedComponentStates();
  const expectedComponents = Object.keys(expectedComponentStates);
  const componentStatus = new Map(
    payload.map((entry) => [String(entry?.name ?? "").trim(), String(entry?.status ?? "").trim().toLowerCase()]),
  );

  const missingComponents = expectedComponents.filter((name) => !componentStatus.has(name));
  if (missingComponents.length > 0) {
    process.stderr.write(`Healthcheck missing expected components: ${missingComponents.join(", ")}\n`);
    process.exit(1);
  }

  const invalidStateComponents = expectedComponents.filter((name) => {
    const acceptedStates = expectedComponentStates[name];
    return !acceptedStates.includes(componentStatus.get(name));
  });
  if (invalidStateComponents.length > 0) {
    const details = invalidStateComponents.map((name) => {
      const actualState = componentStatus.get(name);
      const acceptedStates = expectedComponentStates[name].join("|");
      return `${name}=${actualState} (accepted: ${acceptedStates})`;
    });
    process.stderr.write(`Healthcheck components in invalid state: ${details.join(", ")}\n`);
    process.exit(1);
  }
}

main().catch((error) => {
  process.stderr.write(`Healthcheck unexpected error: ${error.message}\n`);
  process.exit(1);
});