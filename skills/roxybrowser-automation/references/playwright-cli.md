# Playwright MCP CLI

The published CLI starts an MCP server. Browser actions are MCP tool calls made after the client connects; they are not shell subcommands.

## Start Stdio Or HTTP

```bash
npx -y --package @roxybrowser/playwright@latest roxybrowser-mcp
npx -y --package @roxybrowser/playwright@latest roxybrowser-mcp --transport http --host 127.0.0.1 --port 3333 --path /mcp
```

Stdio is the default and is the mode used by the Codex plugin. HTTP is useful for an inspector or a separately managed client.

## Important Options

- Assets: `--artifacts-dir`, `--downloads-dir`, `--screenshots-dir`, `--snapshots-dir`, `--traces-dir`, `--videos-dir`, `--network-dir`, `--console-dir`, `--scripts-dir`, `--temp-dir`.
- Capabilities: `--caps storage,devtools,network,pdf,testing,vision`.
- Page behavior: `--snapshot-mode full|none`, `--timeout-action`, `--timeout-navigation`, `--timeout-settle`, `--viewport-size WIDTHxHEIGHT`, `--device`, `--mobile`.
- Network policy: `--allowed-hosts`, `--allowed-origins`, `--blocked-origins`, `--block-service-workers`, `--ignore-https-errors`.
- Initialization: repeat `--init-page` or `--init-script` as needed; use `--storage-state` or `--secrets` only with user-authorized data.

For normal Codex operation, configure the plugin environment rather than starting a duplicate MCP server. Use the CLI when debugging transport behavior or when another MCP client needs the server.

## Connection Rule

The stdio and HTTP servers expose `roxy_browser_connect`. Pass the endpoint from `roxy_profile_open` or `roxy_profile_connection_info`, with `browser: "chrome"` for CDP or `browser: "firefox"` for BiDi.

`roxy_browser_launch` is not registered by these transports. It exists only in a custom in-memory server initialized with `roxyBrowserLaunch` settings.

Artifact filenames passed to MCP tools should normally be relative. The server resolves them under the configured asset directories and rejects absolute paths by default.
