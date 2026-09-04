---
name: roxybrowser-playwright-cli
description: Automate a real RoxyBrowser session through the endpoint-first Playwright CLI or loaded Playwright MCP tools, including navigation, snapshot interaction, screenshots, storage, network inspection, tracing, recording, and video.
---

# RoxyBrowser Playwright CLI

Use this skill for real RoxyBrowser browser workflows. Prefer the loaded
Playwright MCP tools when they are available in Codex. Use the direct CLI when
shell automation is more suitable or when an MCP transport is not loaded.

For CLI actions, run the published package through npm; do not assume a global
binary is installed:

```bash
npx -y @roxybrowser/playwright@2.0.6-beta.4 <command>
```

The CLI connects to an existing browser. It does not select a RoxyBrowser
profile, call the RoxyBrowser OpenAPI, launch a browser, or accept `dirid`,
`--browser`, or `--profile`. Use the OpenAPI tools first to open a profile and
obtain its CDP or WebDriver BiDi endpoint.

## Profile Handoff

1. Discover a real profile with `roxy_profile_list`, or use the exact profile
   ID supplied by the user.
2. Call `roxy_profile_connection_info` for an open profile. If no endpoint
   exists, call `roxy_profile_open` and use its returned CDP (Chromium) or
   WebDriver BiDi (Firefox) WebSocket endpoint.
3. Use that endpoint with either `roxy_browser_connect` (MCP) or `--cdp` /
   `--bidi` (CLI). Neither path selects a profile or launches a browser on its
   own.

## MCP Interaction

When using loaded MCP tools, run `browser_snapshot` before choosing a ref or
interacting, and take a fresh snapshot after navigation or a major DOM change.
Prefer `browser_navigate`, `browser_click`, `browser_fill_form`,
`browser_type`, `browser_press_key`, `browser_select_option`,
`browser_wait_for`, and `browser_tabs` over code execution. Use
`browser_take_screenshot` when visual state matters, and use network or
console inspection after the action that may explain a failure.

Close a temporary MCP session with `browser_close`; closing it is separate
from closing the RoxyBrowser profile, which requires an explicit
`roxy_profile_close` request.

## Connect And Keep A Session

Choose one protocol and give the session a stable name:

```bash
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work --cdp <endpoint> open https://example.com
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work --bidi <endpoint> open https://example.com
```

Use `--cdp` for Chrome/Chromium CDP endpoints (HTTP(S) or WebSocket) and
`--bidi` for Firefox WebDriver BiDi WebSocket endpoints. They are mutually
exclusive. `ROXY_CDP_ENDPOINT` and `ROXY_BIDI_ENDPOINT` are environment
fallbacks.

The named session keeps a background daemon and remembers its endpoint and
protocol. Put first-use settings such as `--output-dir`, `--config`,
`--mobile`, or `--device` on the command that supplies the endpoint. Reuse the
same session name afterward. Finish with `close` or use `detach` when the
external browser should remain open.

## Snapshot-First Interaction

Capture a snapshot before selecting an element, then use its current refs:

```bash
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work snapshot
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work click e12
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work fill e19 "user@example.com"
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work press Enter
```

Refs are invalidated by navigation and major DOM changes. Take a fresh
snapshot before retrying. Stable unique CSS selectors and Playwright-style
locators are also accepted:

```bash
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work click "#main > button.submit"
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work click "getByRole('button', { name: 'Save' })"
```

Commands run in the background and do not activate the RoxyBrowser window.
Use an explicit foreground action only when the workflow requires it.

## Safety

- Do not bypass authentication, access controls, captchas, rate limits, or a
  site's terms. Pause when login, MFA, captcha, payment, or destructive
  confirmation is required.
- Do not type passwords, tokens, payment details, or private account data
  unless the user explicitly provides it for this task.
- Prefer normal interaction commands over evaluation for actions they can
  perform. Keep evaluation read-only or narrowly scoped and report its use.
- Report the exact blocked operation and error returned by RoxyBrowser or the
  site; do not hunt for hidden endpoints.

## Output And Cleanup

Use `--raw` for a single result, `--json` for structured shell consumption,
and `--output-dir` or `--filename` for durable artifacts:

```bash
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work --raw eval "document.title"
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work requests --json
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work screenshot --filename=page.png
npx -y @roxybrowser/playwright@2.0.6-beta.4 -s=work close
```

Use `list` or `show --json` to inspect sessions and `close-all` or `kill-all`
only when managing all sessions is intentional. Run `help` or
`<command> --help` to check the current command surface.
