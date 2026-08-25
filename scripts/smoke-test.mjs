import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const pluginRoot = join(root, "plugins/roxybrowser");

await access(join(pluginRoot, "bin/roxybrowser-openapi-mcp"), constants.R_OK);
await access(join(pluginRoot, "bin/roxybrowser-playwright-mcp"), constants.R_OK);

const version = await run(join(pluginRoot, "bin/roxybrowser-openapi-mcp"), ["version"], {
  ROXY_API_KEY: "smoke-test-key",
  ROXY_WORKSPACE_ID: "smoke-workspace",
  ROXY_API_HOST: "http://127.0.0.1:50000",
  ROXY_TIMEOUT: "30000",
});
console.log(version.trim());
console.log("@roxybrowser/playwright MCP wrapper resolved.");

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: pluginRoot,
      env: { ...process.env, ...extraEnv },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || stdout || `Command exited with ${code}`));
      }
    });
  });
}
