# RoxyBrowser OAuth File Contract

The Codex plugin starts `@roxybrowser/openapi` directly through `npx`. The
published CLI reads either its connection environment variables or a local
JSON file written by RoxyBrowser.

## Required RoxyBrowser behavior

1. Complete the RoxyBrowser login and workspace selection in the desktop app.
2. Write the local JSON config file after authorization succeeds.
3. Restrict the file to the current user.
4. Refresh the Codex plugin after the file changes.

## Default config file path

The OpenAPI CLI reads:

```text
~/.roxy-agent/state/codex-oauth.json
```

RoxyBrowser should resolve this path through `@roxy/shared/agent-paths`.
`ROXY_CODEX_CONFIG_PATH` can override it for manual testing.

## Accepted JSON keys

The CLI accepts `apiKey`, `workspaceId`, `apiHost`, and `timeout`.

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

1. RoxyBrowser shows its local setup/auth page.
2. The user completes login and selects a workspace.
3. RoxyBrowser writes `codex-oauth.json`.
4. The user reloads the Codex plugin.

## What the plugin does next

Codex runs `npx -y @roxybrowser/openapi@3.1.1`. The CLI reads the JSON file
itself. Explicit CLI options and the corresponding `ROXY_*` environment
variables take precedence over file values.

## Do not do

- Do not require the user to paste secrets into Codex chat.
- Do not depend on a post-install hook that Codex does not expose.
