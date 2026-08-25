# RoxyBrowser OAuth Bootstrap Contract

This document describes the only RoxyBrowser-side work required for the current Codex plugin wrapper flow.

The plugin does not implement a new MCP server. It uses:

- `@roxybrowser/openapi`
- `@roxybrowser/playwright`

The wrapper starts `@roxybrowser/openapi` by reading either environment variables or a local config file. If both are missing, it opens:

```text
roxybrowser://codex/oauth
```

## Required RoxyBrowser behavior

1. Register `roxybrowser://` as a system URL scheme.
2. Handle the `codex/oauth` path.
3. Open a local RoxyBrowser page or modal for OAuth/bootstrap.
4. After success, write a local JSON config file.
5. Make sure the file is readable by the current user only.

## Default config file path

The plugin wrapper will look for:

```text
~/.roxy-agent/state/codex-oauth.json
```

RoxyBrowser should resolve this path through `@roxy/shared/agent-paths`. `ROXY_CODEX_CONFIG_PATH` can override this path for manual testing.

## Accepted JSON keys

The wrapper accepts any of these key names:

- `apiKey`, `token`, `api_key`
- `workspaceId`, `workspace_id`
- `apiHost`, `api_host`
- `timeout`

Minimal example:

```json
{
  "apiKey": "roxy_xxx",
  "workspaceId": "19744",
  "apiHost": "http://127.0.0.1:50000",
  "timeout": "30000"
}
```

## Recommended App flow

1. User opens `roxybrowser://codex/oauth`.
2. RoxyBrowser shows a local setup/auth page.
3. User completes login or enters the needed values.
4. RoxyBrowser writes `codex-oauth.json`.
5. User re-runs Codex or reloads the plugin.

## What the plugin does next

On launch, the wrapper reads the config file and exports:

- `ROXY_API_KEY`
- `ROXY_WORKSPACE_ID`
- `ROXY_API_HOST`
- `ROXY_TIMEOUT`

Then it starts the published MCP packages unchanged.

## Do not do

- Do not change `@roxybrowser/openapi` or `@roxybrowser/playwright` for this bootstrap path.
- Do not require the user to paste secrets into Codex chat.
- Do not depend on a post-install hook that Codex does not expose.
