import { access, realpath } from "node:fs/promises";
import { constants } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const OPENAPI_BIN = process.platform === "win32" ? "roxybrowser-openapi-mcp.cmd" : "roxybrowser-openapi-mcp";

async function main() {
  const openapi = await loadOpenapiPackage();
  const command = process.argv[2];

  if (command === "version") {
    printJson({ packageVersion: openapi.ROXY_OPENAPI_VERSION });
    return;
  }

  if (command === "supports") {
    const [operation, roxyBrowserVersion] = process.argv.slice(3);
    if (!operation || !roxyBrowserVersion) {
      throw new Error("Usage: roxybrowser-openapi-mcp supports <operation> <roxyBrowserVersion>");
    }
    printJson({
      operationId: operation,
      roxyBrowserVersion,
      supported: openapi.isRoxyCapabilitySupported(operation, roxyBrowserVersion),
      capability: openapi.getRoxyCapability(operation) ?? null,
    });
    return;
  }

  if (command && command !== "browser" && command !== "--browser") {
    throw new Error(`Unsupported roxybrowser-openapi-mcp command in Codex wrapper: ${command}`);
  }

  const roxy = readRoxyOptions();
  await openapi.createRoxyBrowserMcpServer({
    roxy,
    context: {
      workspaceId: roxy.workspaceId,
    },
  }).run();
}

async function loadOpenapiPackage() {
  try {
    return await import("@roxybrowser/openapi");
  } catch (error) {
    if (error?.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }

  const packageRoot = await findOpenapiPackageRootFromPath();
  return await import(pathToFileURL(join(packageRoot, "lib/index.js")).href);
}

async function findOpenapiPackageRootFromPath() {
  for (const pathDir of process.env.PATH?.split(delimiter) ?? []) {
    const candidate = join(pathDir, OPENAPI_BIN);
    try {
      await access(candidate, constants.X_OK);
      const bin = await realpath(candidate);
      return dirname(dirname(bin));
    } catch {
      // Keep scanning PATH entries installed by npx.
    }
  }

  throw new Error("Unable to resolve @roxybrowser/openapi from local dependencies or npx PATH.");
}

function readRoxyOptions() {
  const workspaceId = parseOptionalInteger(process.env.ROXY_WORKSPACE_ID, "ROXY_WORKSPACE_ID");
  const timeout = parseOptionalInteger(process.env.ROXY_TIMEOUT, "ROXY_TIMEOUT") ?? 30000;

  return {
    apiKey: process.env.ROXY_API_KEY,
    apiHost: process.env.ROXY_API_HOST || "http://127.0.0.1:50000",
    workspaceId,
    timeout,
  };
}

function parseOptionalInteger(value, name) {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
