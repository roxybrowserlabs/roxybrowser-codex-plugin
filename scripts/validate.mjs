import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

async function main() {
  const marketplace = await readJson(".agents/plugins/marketplace.json");
  assert(marketplace?.plugins?.[0]?.source?.path === "./plugins/roxybrowser", "marketplace path must point to the published plugin");

  const plugin = await readJson("plugins/roxybrowser/.codex-plugin/plugin.json");
  assert(plugin.name === "roxybrowser", "plugin name must be roxybrowser");
  assert(plugin.version === "0.1.1", "plugin version must be 0.1.1");
  assert(plugin.skills === "./skills/", "plugin skills path must be ./skills/");
  assert(plugin.mcpServers === "./.mcp.json", "plugin mcpServers path must be ./.mcp.json");
  assert(plugin.interface?.displayName === "RoxyBrowser", "plugin displayName must be RoxyBrowser");

  const mcp = await readJson("plugins/roxybrowser/.mcp.json");
  assert(mcp.mcpServers?.roxybrowserOpenapi, "missing roxybrowserOpenapi MCP server");
  assert(mcp.mcpServers?.roxybrowserPlaywright, "missing roxybrowserPlaywright MCP server");
  assert(
    mcp.mcpServers.roxybrowserOpenapi.command === "./bin/roxybrowser-openapi-mcp",
    "openapi server must use the explicit plugin wrapper",
  );
  assert(
    mcp.mcpServers.roxybrowserPlaywright.command === "./bin/roxybrowser-playwright-mcp",
    "playwright server must use the explicit plugin wrapper",
  );

  for (const path of [
    "plugins/roxybrowser/bin/lib/bootstrap-config.mjs",
    "plugins/roxybrowser/bin/lib/openapi-launcher.mjs",
    "plugins/roxybrowser/bin/roxybrowser-openapi-mcp",
    "plugins/roxybrowser/bin/roxybrowser-openapi-mcp.cmd",
    "plugins/roxybrowser/bin/roxybrowser-playwright-mcp",
    "plugins/roxybrowser/bin/roxybrowser-playwright-mcp.cmd",
    "plugins/roxybrowser/docs/roxybrowser-oauth-bootstrap.md",
    "plugins/roxybrowser/skills/roxybrowser-control/SKILL.md",
    "plugins/roxybrowser/skills/roxybrowser-automation/SKILL.md",
    "plugins/roxybrowser/skills/roxybrowser-script-writing/SKILL.md",
    "plugins/roxybrowser/docs/codex-connector.schema.json",
    "plugins/roxybrowser/README.md",
    "plugins/roxybrowser/LICENSE",
  ]) {
    await access(join(root, path));
  }

  console.log("Plugin wrapper files validated.");
}

async function readJson(path) {
  const raw = await readFile(join(root, path), "utf8");
  assert(!raw.includes("[TODO:"), `${path} contains a TODO placeholder`);
  return JSON.parse(raw);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

await main();
