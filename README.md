# Quantum Graph

An interactive 3D network graph demo built with Three.js and Vite.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Drag to orbit, scroll to zoom, hover over nodes, and click a node to update the inspector.

## Production build

```bash
npm run build
npm run preview
```

The hardcoded graph data lives at the top of `src/main.js`.

## Trigger a webhook pulse

The demo exposes a browser function that can be called from application code or the developer console:

```js
window.dispatchGraphWebhook({
  from: 'NEXUS',
  to: 'HELIX',
  event: 'DEPLOY_COMPLETE',
})
```

The destination must be directly connected to the source. If `to` is omitted or invalid, the demo selects a connected node automatically.
