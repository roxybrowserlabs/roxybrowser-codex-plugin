# RoxyBrowser Codex Plugin

This repository is a Codex plugin marketplace root. The publishable plugin lives at `plugins/roxybrowser`.

It does not implement a new MCP server. It packages the existing public RoxyBrowser MCP packages for Codex:

- `@roxybrowser/openapi`: RoxyBrowser workspace, project, profile, proxy, and platform-account MCP tools.
- `@roxybrowser/playwright`: browser automation MCP tools for real browser sessions.

The RoxyBrowser desktop app remains the product surface for OAuth bootstrap, local service status, and future one-click Codex setup.

## Requirements

- Node.js 20 or newer
- RoxyBrowser local API running on loopback
- `ROXY_API_KEY` or a local bootstrap file written by RoxyBrowser
- `ROXY_WORKSPACE_ID`

Optional:

- `ROXY_API_HOST`, default `http://127.0.0.1:50000`
- `ROXY_TIMEOUT`, default `30000`
- `ROXY_CODEX_CONFIG_PATH`
- `ROXY_CODEX_OAUTH_URL`, default `roxybrowser://codex/oauth`
- `PLAYWRIGHT_MCP_OUTPUT_DIR`
- `PLAYWRIGHT_MCP_ALLOWED_HOSTS`
- `PLAYWRIGHT_MCP_ALLOWED_ORIGINS`
- `PLAYWRIGHT_MCP_BLOCKED_ORIGINS`
- `PLAYWRIGHT_MCP_CAPS`

## Development

```bash
npm install
npm run validate
npm run smoke
```

The plugin wrapper starts the package-owned MCP servers through explicit paths:

```bash
./bin/roxybrowser-openapi-mcp version
./bin/roxybrowser-playwright-mcp
```

If `ROXY_API_KEY` and `ROXY_WORKSPACE_ID` are missing, the OpenAPI wrapper opens the OAuth bootstrap URL and then reads a local config file on the next launch.

Default config path:

- macOS: `~/Library/Application Support/RoxyBrowser/codex-oauth.json`
- Windows: `%APPDATA%/RoxyBrowser/codex-oauth.json`
- Linux: `~/.config/roxybrowser/codex-oauth.json`

## Codex Plugin

The plugin manifest is at `.codex-plugin/plugin.json`.

The MCP config starts two servers:

```json
{
  "mcpServers": {
    "roxybrowserOpenapi": {
      "command": "./bin/roxybrowser-openapi-mcp",
      "args": [],
      "cwd": "."
    },
    "roxybrowserPlaywright": {
      "command": "./bin/roxybrowser-playwright-mcp",
      "args": [],
      "cwd": "."
    }
  }
}
```

## Manual Codex MCP Fallback

Use the already-published packages directly if the Codex plugin marketplace flow is unavailable.

OpenAPI/profile tools:

```bash
codex mcp add roxybrowser-openapi \
  --env ROXY_API_KEY=YOUR_API_KEY \
  --env ROXY_API_HOST=http://127.0.0.1:50000 \
  --env ROXY_TIMEOUT=30000 \
  --env ROXY_WORKSPACE_ID=19744 \
  -- npx -y @roxybrowser/openapi@latest roxybrowser-openapi-mcp
```

Browser automation tools:

```bash
codex mcp add roxybrowser-playwright \
  -- npx -y --package @roxybrowser/playwright@latest roxybrowser-mcp
```

## Tool Ownership

This repository intentionally does not redefine MCP tool schemas. Tool names, arguments, version gating, and runtime behavior are owned by:

- `@roxybrowser/openapi`
- `@roxybrowser/playwright`

Codex skills in this repository only add workflow guidance and safety constraints.

## Future Desktop Connector

The product plan includes a Codex-specific connector token and one-click setup from RoxyBrowser. The draft connector schema is kept at `docs/codex-connector.schema.json` so the desktop app and plugin can converge on the same authorization contract later.

For the RoxyBrowser-side implementation details of the current bootstrap path, see [docs/roxybrowser-oauth-bootstrap.md](./docs/roxybrowser-oauth-bootstrap.md).
