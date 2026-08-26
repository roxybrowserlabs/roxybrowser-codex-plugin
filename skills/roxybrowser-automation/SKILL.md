---
name: roxybrowser-automation
description: Automate a real RoxyBrowser browser session with Playwright MCP, snapshot-first interaction, and saved visual or diagnostic artifacts.
---

# RoxyBrowser Automation

Use this skill when the user asks to navigate a real site, inspect login state, interact with page controls, capture screenshots, inspect network or console output, or verify a browser workflow.

## Session Handoff

1. Discover a real profile with `roxy_profile_list`, or use the exact profile ID supplied by the user.
2. Call `roxy_profile_connection_info` for an open profile. If no endpoint exists, call `roxy_profile_open` and use its returned CDP (Chromium) or WebDriver BiDi (Firefox) WebSocket endpoint.
3. Connect the Playwright MCP session with `roxy_browser_connect` and the endpoint. The stdio/HTTP server does not expose `roxy_browser_launch`; that convenience tool is only available for an in-memory server configured with launch settings.
4. Run `browser_snapshot` before choosing a ref or interacting. After navigation or a major DOM change, take a fresh snapshot.

In Codex, use the loaded Playwright MCP tools for page actions. If you need to start the server outside Codex, the official entry is `npx -y --package @roxybrowser/playwright@latest roxybrowser-mcp`; it starts an MCP transport, not a single browser action. Read [references/playwright-cli.md](references/playwright-cli.md) for transport, capability, timeout, origin, and artifact options.

## Interaction Loop

- Prefer `browser_navigate`, `browser_click`, `browser_fill_form`, `browser_type`, `browser_press_key`, `browser_select_option`, `browser_wait_for`, and `browser_tabs` over code execution.
- Use accessible snapshot refs or stable labels. Re-snapshot after a click that changes the page.
- Use `browser_take_screenshot` when visual state matters; use `browser_network_requests` or `browser_console_messages` after the action that may explain a failure.
- Use `browser_file_upload`, `browser_pdf_save`, tracing, and storage tools only when requested or needed to verify the workflow. Keep artifact filenames relative to the configured asset directory.
- Close the MCP browser session with `browser_close` when the user asked for a temporary session. Closing a session is separate from closing the RoxyBrowser profile; use `roxy_profile_close` only when requested.

## Safety

- Do not bypass authentication, access controls, captchas, rate limits, or a site's terms. Pause for user input when a login, MFA, captcha, payment, or destructive confirmation is required.
- Do not type passwords, tokens, payment details, or private account data unless the user explicitly provides it for this task.
- Do not use `browser_evaluate` or `browser_run_code_unsafe` for an action that a normal interaction tool can perform. When code is necessary, keep it read-only or narrowly scoped and report that it was used.
- Report the exact blocked operation and error returned by RoxyBrowser or the site; do not hunt for hidden endpoints.
