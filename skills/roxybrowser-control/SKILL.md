---
name: roxybrowser-control
description: Use RoxyBrowser profiles, projects, proxies, accounts, and workspace tools safely from Codex.
---

# RoxyBrowser Control

Use this skill when the user asks Codex to inspect, create, update, open, or close RoxyBrowser profiles, or to inspect RoxyBrowser proxies, platform accounts, projects, labels, or workspace state.

The MCP tools are provided by `@roxybrowser/openapi`. This plugin only adds Codex workflow guidance.

## Workflow

1. Use `roxy_workspace_list` when no workspace is configured.
2. Use `roxy_project_list`, `roxy_label_list`, and `roxy_profile_list` to obtain real IDs.
3. Use `roxy_profile_get` or `roxy_profile_connection_info` before changing or connecting to a profile.
4. Open or close profiles only when the user asked for that operation or it is necessary for browser automation.
5. For profile, proxy, or platform-account creation/update, summarize the intended fields before calling write tools if the request is ambiguous.

## Safety

- Do not guess workspace, project, label, profile, proxy, account, or session IDs.
- Do not claim a proxy is currently reachable from `roxy_proxy_list`; use `roxy_proxy_detect`.
- Treat account data as sensitive. Do not reveal secrets, cookies, passwords, tokens, or full credential values.
- Use delete tools only when the user explicitly asks for that exact deletion target in the current task.
- If the API key is missing or rejected, ask the user to reconnect or refresh credentials from RoxyBrowser instead of trying hidden endpoints.

## Tools

- `roxy_workspace_list`
- `roxy_project_list`
- `roxy_label_list`
- `roxy_profile_list`
- `roxy_profile_get`
- `roxy_profile_connection_info`
- `roxy_profile_create`
- `roxy_profile_update`
- `roxy_profile_open`
- `roxy_profile_close`
- `roxy_profile_delete`
- `roxy_profile_randomize_fingerprint`
- `roxy_profile_clear_local_cache`
- `roxy_profile_clear_server_cache`
- `roxy_proxy_list`
- `roxy_proxy_create`
- `roxy_proxy_update`
- `roxy_proxy_delete`
- `roxy_proxy_detect`
- `roxy_proxy_detect_channels`
- `roxy_platform_account_list`
- `roxy_platform_account_create`
- `roxy_platform_account_update`
- `roxy_platform_account_delete`
