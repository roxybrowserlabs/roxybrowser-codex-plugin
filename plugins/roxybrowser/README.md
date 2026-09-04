# RoxyBrowser Codex Plugin

This plugin is the publishable Codex package for RoxyBrowser. It does not implement a new MCP server. It configures the existing public RoxyBrowser packages for Codex and documents both MCP and direct CLI use:

- `@roxybrowser/openapi@3.1.1`: RoxyBrowser workspace, project, profile, proxy, and platform-account MCP tools plus Agent-friendly `help`/`call`, lower-level `sdk`, and raw `api` CLI calls.
- `@roxybrowser/playwright@2.0.6-beta.4`: endpoint-first browser automation CLI for real browser sessions. The plugin also keeps the `2.0.5` MCP transport for existing Codex MCP tool compatibility.

The RoxyBrowser desktop app remains the product surface for OAuth bootstrap, local service status, and future one-click Codex setup.

## Requirements

- Node.js 24.11.0 or newer (required by `@roxybrowser/openapi` 3.x)
- RoxyBrowser local API running on loopback
- `ROXY_API_KEY` and `ROXY_WORKSPACE_ID`, or the local bootstrap file written by RoxyBrowser

Optional:

- `ROXY_API_HOST`, default `http://127.0.0.1:50000`
- `ROXY_TIMEOUT`, default `30000`
- `ROXY_CODEX_CONFIG_PATH`
- `ROXY_CDP_ENDPOINT`, `ROXY_BIDI_ENDPOINT`
- `PLAYWRIGHT_MCP_OUTPUT_DIR` (legacy MCP transport)
- `PLAYWRIGHT_MCP_ALLOWED_HOSTS`
- `PLAYWRIGHT_MCP_ALLOWED_ORIGINS`
- `PLAYWRIGHT_MCP_BLOCKED_ORIGINS`
- `PLAYWRIGHT_MCP_CAPS`
- `ROXY_PLAYWRIGHT_ARTIFACTS_DIR`, `ROXY_PLAYWRIGHT_*_DIR`
- `PLAYWRIGHT_MCP_TIMEOUT_*`, `PLAYWRIGHT_MCP_DEVICE`, `PLAYWRIGHT_MCP_VIEWPORT_SIZE`

## Development

```bash
npm install
npm run validate
npm run smoke
```

The plugin starts the published package CLIs directly through `npx`:

```bash
npx -y @roxybrowser/openapi version
npx -y @roxybrowser/playwright@2.0.6-beta.4 help
```

The OpenAPI CLI reads `~/.roxy-agent/state/codex-oauth.json` itself. An empty
`env | grep ROXY_` result does not indicate a missing RoxyBrowser login. Test
the saved credentials through a real direct call:

```bash
npx -y @roxybrowser/openapi call roxy_profile_list '{}'
```

In a marketplace install, the plugin does not require a local `node_modules`
folder. Codex runs both published packages directly through `npx`.

Default config path:

- `~/.roxy-agent/state/codex-oauth.json`

Set `ROXY_CODEX_CONFIG_PATH` only when you need to override this path manually.

## Codex Plugin

The plugin manifest is at `.codex-plugin/plugin.json`.

The MCP config starts two servers:

```json
{
  "mcpServers": {
    "roxybrowserOpenapi": {
      "command": "npx",
      "args": ["-y", "@roxybrowser/openapi@3.1.1"],
      "cwd": "."
    },
    "roxybrowserPlaywright": {
      "command": "npx",
      "args": ["-y", "--package", "@roxybrowser/playwright@2.0.5", "roxybrowser-mcp"],
      "cwd": "."
    }
  }
}
```

## Manual Codex MCP Fallback

Use the already-published packages directly if the Codex plugin marketplace flow is unavailable.

OpenAPI/profile tools:

```bash
codex mcp add roxybrowser-openapi -- npx -y @roxybrowser/openapi@3.1.1
```

Browser automation tools:

```bash
codex mcp add roxybrowser-playwright \
  -- npx -y --package @roxybrowser/playwright@2.0.5 roxybrowser-mcp
```

## Direct CLI

Use OpenAPI directly for one-off SDK or raw endpoint calls without registering an MCP server:

```bash
npx -y @roxybrowser/openapi help tools
npx -y @roxybrowser/openapi call roxy_profile_list '{"page":1,"pageSize":20}'
npx -y @roxybrowser/openapi call roxy_profile_open '{"dirId":"PROFILE_ID"}'
npx -y @roxybrowser/openapi sdk profiles.list '{"page":1,"pageSize":20}'
npx -y @roxybrowser/openapi api POST /browser/new_feature '{"dirId":"PROFILE_ID"}'
```

Use the Playwright CLI for direct browser actions after obtaining a CDP or BiDi
endpoint from the profile tools. The named session keeps state between commands:

```bash
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work --cdp <endpoint> open https://example.com
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work snapshot
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work click e12
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work close
```

The beta CLI is endpoint-first: it does not select profiles or launch the
browser. For the legacy MCP transport, use the pinned `2.0.5` configuration
above.

## Tool Ownership

This repository intentionally does not redefine MCP tool schemas. Tool names, arguments, version gating, and runtime behavior are owned by:

- `@roxybrowser/openapi`
- `@roxybrowser/playwright`

Codex skills in this repository only add workflow guidance and safety constraints.

## Future Desktop Connector

The product plan includes a Codex-specific connector token and one-click setup from RoxyBrowser. The draft connector schema is kept at `docs/codex-connector.schema.json` so the desktop app and plugin can converge on the same authorization contract later.

For the RoxyBrowser-side implementation details of the current bootstrap path, see [docs/roxybrowser-oauth-bootstrap.md](./docs/roxybrowser-oauth-bootstrap.md).
