---
name: roxybrowser-script-writing
description: Describe and run RoxyBrowser automation scripts from Codex while respecting parameter schemas and sandbox boundaries.
---

# RoxyBrowser Script Writing

Use this skill when the user asks Codex to prepare browser automation code or reusable RoxyBrowser automation flows.

This Codex plugin currently delegates MCP runtime behavior to `@roxybrowser/openapi` and `@roxybrowser/playwright`. It does not ship a separate RoxyBrowser script bridge yet.

## Workflow

1. For direct browser automation, use the Playwright MCP tools from `@roxybrowser/playwright`.
2. For profile setup, use `@roxybrowser/openapi` tools first and work from real profile IDs.
3. If the user asks for a RoxyBrowser sandbox script bridge, say that this plugin does not expose script list/describe/run tools yet.
4. When writing script source for the user, keep it compatible with public RoxyBrowser APIs and avoid private desktop-app internals.

## Safety

- Do not invent `roxy_script_*` tools; they are not part of this plugin MVP.
- Do not claim runtime success from static script source or metadata.
- If a flow needs permissions not granted by RoxyBrowser, stop and ask the user to reauthorize in RoxyBrowser.

## Tools

- `roxy_profile_list`
- `roxy_profile_open`
- `roxy_profile_connection_info`
- `roxy_browser_launch`
- `roxy_browser_connect`
- `browser_snapshot`
- `browser_run_code_unsafe`
