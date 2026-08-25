---
name: roxybrowser-automation
description: Automate real RoxyBrowser browser sessions from Codex with snapshot-first interaction and visual verification.
---

# RoxyBrowser Automation

Use this skill when the user asks Codex to operate a real website through RoxyBrowser, inspect login state, click, type, take screenshots, read network activity, or inspect console output.

Profile, proxy, and connection discovery come from `@roxybrowser/openapi`. Page automation comes from `@roxybrowser/playwright`.

## Workflow

1. Use `roxy_profile_list` to get a real profile ID, unless the user already gave an exact ID.
2. Use `roxy_profile_open` or `roxy_profile_connection_info` to obtain the live browser connection details.
3. Use `roxy_browser_launch` or `roxy_browser_connect` from the Playwright MCP server when those tools are available.
4. Run `browser_snapshot` before clicking or typing.
5. Prefer locator/snapshot tools such as `browser_click`, `browser_type`, `browser_fill_form`, and `browser_wait_for` over unsafe code execution.
6. Use `browser_take_screenshot` when visual layout, login state, captcha, or page rendering matters.
7. Use `browser_network_requests` and `browser_console_messages` for debugging after a page action.
8. Close browser sessions with `browser_close` when the user asked for a temporary session and the work is complete.

## Safety

- Do not bypass website authentication, access controls, captchas, or rate limits.
- Do not type passwords, tokens, payment details, or private account data unless the user explicitly provides them in the current task.
- Do not use `browser_evaluate` or `browser_run_code_unsafe` for destructive actions when normal interaction tools can do the job.
- If RoxyBrowser rejects an operation for missing permission, report that and stop. Do not search for alternate hidden endpoints.

## Tools

- `roxy_browser_launch`
- `roxy_browser_connect`
- `browser_snapshot`
- `browser_click`
- `browser_hover`
- `browser_fill_form`
- `browser_type`
- `browser_wait_for`
- `browser_take_screenshot`
- `browser_evaluate`
- `browser_network_requests`
- `browser_console_messages`
- `browser_close`
