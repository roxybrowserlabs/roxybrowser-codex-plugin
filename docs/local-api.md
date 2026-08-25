# RoxyBrowser Codex Integration Boundary

This plugin does not define a new local API.

Current MCP tool behavior is owned by the public packages:

- `@roxybrowser/openapi`
- `@roxybrowser/playwright`

RoxyBrowser Desktop should continue to expose the local API and Playwright/CDP connection capabilities those packages already use.

## Future Connector Token

The planned one-click Codex flow can add a Codex-specific connector token so RoxyBrowser does not have to place the main API key directly in Codex config.

The draft connector file schema is `docs/codex-connector.schema.json`.

When that product-side work starts, keep it as an authorization/configuration layer for the existing packages. Do not add a second MCP implementation here unless the public packages cannot support the required contract.
