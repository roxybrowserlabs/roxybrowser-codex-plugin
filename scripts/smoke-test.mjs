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
const packageVersion = JSON.parse(version).packageVersion;
if (packageVersion !== "3.1.0") {
  throw new Error("OpenAPI wrapper did not resolve 3.1.0.");
}

const help = await run(join(pluginRoot, "bin/roxybrowser-openapi-mcp"), ["--help"], {
  HOME: "/tmp/roxybrowser-codex-plugin-smoke-no-config",
});
for (const command of ["call", "sdk", "api", "supports"]) {
  if (!help.includes(command)) {
    throw new Error(`OpenAPI CLI help did not expose ${command}.`);
  }
}
console.log("OpenAPI wrapper forwarded official CLI help.");

const toolHelp = await run(join(pluginRoot, "bin/roxybrowser-openapi-mcp"), ["help", "tools"], {
  HOME: "/tmp/roxybrowser-codex-plugin-smoke-no-config",
});
for (const marker of ["Browser MCP tools:", "roxy_profile_list", "call roxy_profile_list"]) {
  if (!toolHelp.includes(marker)) {
    throw new Error(`OpenAPI CLI help tools did not expose ${marker}.`);
  }
}
console.log("OpenAPI CLI exposed the Agent-facing browser tool catalog.");
console.log("@roxybrowser/playwright MCP wrapper resolved.");

const tools = await listMcpTools(join(pluginRoot, "bin/roxybrowser-openapi-mcp"), {
  ROXY_API_KEY: "smoke-test-key",
  ROXY_WORKSPACE_ID: "116613",
  ROXY_API_HOST: "http://127.0.0.1:50000",
  ROXY_TIMEOUT: "30000",
});
if (!tools.some((tool) => tool.name === "roxy_profile_list")) {
  throw new Error("roxy_profile_list was not exposed by the OpenAPI MCP server.");
}
console.log(`OpenAPI MCP exposed ${tools.length} tools including roxy_profile_list.`);

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

function listMcpTools(command, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [], {
      cwd: pluginRoot,
      env: { ...process.env, ...extraEnv },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const pending = new Map();
    let stdout = "";
    let stderr = "";
    let nextId = 1;
    let settled = false;

    const timeout = setTimeout(() => {
      finish(new Error(`Timed out waiting for MCP tools/list. stderr: ${stderr}`));
    }, 10000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      let newlineIndex;
      while ((newlineIndex = stdout.indexOf("\n")) >= 0) {
        const line = stdout.slice(0, newlineIndex).trim();
        stdout = stdout.slice(newlineIndex + 1);
        if (!line) continue;

        let message;
        try {
          message = JSON.parse(line);
        } catch (error) {
          finish(new Error(`Non-JSON MCP stdout: ${line}`));
          return;
        }

        const waiter = pending.get(message.id);
        if (waiter) {
          pending.delete(message.id);
          waiter(message);
        }
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", finish);
    child.on("close", (code) => {
      if (!settled && code !== 0) {
        finish(new Error(stderr || `MCP process exited with ${code}`));
      }
    });

    request("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "roxybrowser-codex-plugin-smoke", version: "0.0.0" },
    })
      .then(() => {
        notify("notifications/initialized", {});
        return request("tools/list", {});
      })
      .then((message) => {
        const tools = message.result?.tools ?? message.tools;
        if (!Array.isArray(tools)) {
          throw new Error(`Invalid tools/list response: ${JSON.stringify(message)}`);
        }
        finish(null, tools);
      })
      .catch(finish);

    function request(method, params) {
      const id = nextId++;
      const message = { jsonrpc: "2.0", id, method, params };
      child.stdin.write(`${JSON.stringify(message)}\n`);
      return new Promise((resolveRequest, rejectRequest) => {
        pending.set(id, (response) => {
          if (response.error) {
            rejectRequest(new Error(JSON.stringify(response.error)));
          } else {
            resolveRequest(response);
          }
        });
      });
    }

    function notify(method, params) {
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
    }

    function finish(error, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      child.kill("SIGTERM");
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    }
  });
}
