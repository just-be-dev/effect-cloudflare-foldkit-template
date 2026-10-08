# Dependency patches

Bun applies these patches on install through `patchedDependencies` in `package.json`. Each patch is tied to an exact version. When you upgrade a patched package, check whether upstream fixed the problem. Then either drop the patch or recreate it with `bun patch <pkg>` and `bun patch --commit node_modules/<pkg>`, and update this file.

Every patch needs an entry here. Inside the patched code, mark the change with a `PATCH:` comment.

## Foldkit DevTools MCP reconnect loop under `alchemy dev`

Patches `@foldkit/vite-plugin@0.26.0` and `@foldkit/devtools-mcp@0.24.0`.

**Symptom.** Under `alchemy dev`, every agent session's Foldkit DevTools MCP server connected to the relay and disconnected many times per second. The MCP tools were unusable, and the dev server log filled with `MCP client connected` and `MCP client disconnected` lines.

**Cause.** Two upstream behaviors combine:

1. `@foldkit/vite-plugin` hosts its MCP relay at `/__foldkit/devtools-mcp` on Vite's own `httpServer`. Alchemy's Cloudflare Vite integration (`handleWebSocket` in `@alchemy.run/cloudflare-runtime`, `src/vite/websockets.ts`) adds its own `upgrade` listener to the same server. That listener forwards every upgrade whose `sec-websocket-protocol` doesn't start with `vite` to workerd. The worker answers with a non-101 response, so Alchemy destroys the socket Foldkit has already accepted. The client sees the connection open and then close with code 1006 about 20 ms later.
2. `@foldkit/devtools-mcp` only backs off when an open fails. When a socket opens and then closes, it reconnects immediately, so (1) turns into a tight loop.

**Patches.**

- `@foldkit/vite-plugin`: `startMcpRelay` always uses `bindLoopbackRelay`, which is a token-protected listener on its own `127.0.0.1` port, published to the relay registry. The relay no longer attaches to Vite's `httpServer`, so Alchemy's upgrade listener never sees it. The fixed `devToolsMcpPort` path is unchanged.
- `@foldkit/devtools-mcp`: in `webSocketClient.js`, a connection that closes within 5 seconds of opening counts as a failure. Reconnects then back off exponentially, from 0.5 s up to 30 s. A connection that stays up longer resets the backoff.

**Remove when** either fix lands upstream and the dev server log shows one stable `MCP client connected` per MCP server under `alchemy dev`:

- Foldkit hosts the relay on a dedicated loopback listener, or otherwise keeps it away from other upgrade handlers, and backs off reconnects after short-lived connections.
- Alchemy's `handleWebSocket` stops forwarding upgrades that another listener has already handled, or only forwards paths the worker serves.

The backoff patch is worth keeping until Foldkit has its own backoff. It stops the loop whatever the cause of the drop.
