import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const CONFIG_FILENAMES = [
  "codex-oauth.json",
  "codex-mcp-config.json",
  "codex-config.json",
];

export async function bootstrapRoxyEnv(env = process.env) {
  const existing = readExistingEnv(env);
  if (existing) {
    return existing;
  }

  const configPath = env.ROXY_CODEX_CONFIG_PATH ?? defaultConfigPath();
  const config = await readConfigFile(configPath);
  if (config) {
    applyConfigToEnv(config, env);
    return config;
  }

  await openOAuthUrl(env.ROXY_CODEX_OAUTH_URL ?? "roxybrowser://codex/oauth");
  throw new Error(
    `RoxyBrowser Codex config not found. Opened OAuth bootstrap URL and expected a config file at ${configPath}.`,
  );
}

function readExistingEnv(env) {
  const apiKey = env.ROXY_API_KEY?.trim();
  const workspaceId = env.ROXY_WORKSPACE_ID?.trim();
  const apiHost = env.ROXY_API_HOST?.trim();

  if (!apiKey || !workspaceId) {
    return null;
  }

  if (apiHost && !apiHost.startsWith("http")) {
    throw new Error(`Invalid ROXY_API_HOST: ${apiHost}`);
  }

  return {
    apiKey,
    workspaceId,
    apiHost: apiHost || "http://127.0.0.1:50000",
    timeout: env.ROXY_TIMEOUT?.trim() || "30000",
  };
}

async function readConfigFile(configPath) {
  try {
    await access(configPath, constants.R_OK);
  } catch {
    return null;
  }

  const parsed = JSON.parse(await readFile(configPath, "utf8"));
  const apiKey = pickString(parsed, ["apiKey", "token", "api_key"]);
  const workspaceId = pickString(parsed, ["workspaceId", "workspace_id"]);
  const apiHost = pickString(parsed, ["apiHost", "api_host"]);
  const timeout = pickString(parsed, ["timeout"]);

  if (!apiKey || !workspaceId) {
    return null;
  }

  return {
    apiKey,
    workspaceId,
    apiHost: apiHost || "http://127.0.0.1:50000",
    timeout: timeout || "30000",
  };
}

function applyConfigToEnv(config, env) {
  env.ROXY_API_KEY = config.apiKey;
  env.ROXY_WORKSPACE_ID = String(config.workspaceId);
  env.ROXY_API_HOST = config.apiHost;
  env.ROXY_TIMEOUT = String(config.timeout);
}

async function openOAuthUrl(url) {
  if (platform() === "darwin") {
    spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    return;
  }

  if (platform() === "win32") {
    spawn("cmd", ["/c", "start", "", url], { stdio: "ignore", detached: true }).unref();
    return;
  }

  spawn("xdg-open", [url], { stdio: "ignore", detached: true }).unref();
}

function defaultConfigPath() {
  if (platform() === "darwin") {
    return join(homedir(), "Library", "Application Support", "RoxyBrowser", chooseConfigName());
  }

  if (platform() === "win32") {
    return join(process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "RoxyBrowser", chooseConfigName());
  }

  return join(homedir(), ".config", "roxybrowser", chooseConfigName());
}

function chooseConfigName() {
  return CONFIG_FILENAMES[0];
}

function pickString(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}
