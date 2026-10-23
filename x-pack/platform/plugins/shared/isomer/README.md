# Isomer

Hosts Kibana's shared Isomer runtime with its primitive packs. The server-only plugin is always enabled and registers no routes, saved objects, or UI.

Its start contract carries `getRuntime()`, which resolves a `createKibanaIsomerRuntime` with the components pack (`@kbn/isomer-components`), the Vega pack (`@kbn/isomer-primitives-vega`), the charts pack (`@kbn/isomer-primitives-charts`), and the maps pack (`@kbn/isomer-primitives-maps`). Charts render as their summaries and data tables. Primitive schemas stay in memory for the life of the process once built, so the runtime and its packs load on the first call rather than at startup, and every later call shares that runtime. Call `getRuntime()` when a request needs it, not during `setup` or `start`.

## Drawing charts on the server

```yaml
xpack.isomer.charts.serverDraw: true
```

`server/charts_drawing.ts` draws charts with Elastic Charts in a jsdom window on Skia (`@kbn/isomer-charts-elastic-node`), in a worker thread: `html` carries each chart as drawn, and `snapshot` returns a PNG rasterized by takumi. It isn't on the start contract yet.

## Follow-ups

These are open gaps. Each needs a decision in the packs or the composition, not a fix in a harness.

- **Panel titles.**
  - A chart node carries `title`, and the charts pack draws it.
  - A Vega node has only `caption`, which is alt text and its text form. A map node has `label`, which the converter does not set.
  - On a dashboard, Kibana prints every panel's title in a header, so Vega and map panels render without the title Kibana shows.
  - The converter also strips the panel title the Alembic planner writes into a Vega spec.
  - Decide whether every node carries a title, or a panel container does.
- **Panels with no primitive.**
  - **Lens data tables and saved searches:** there is no table primitive yet.
  - **Markdown panels:** the components pack's `markdown` fits them, but the converter doesn't map them yet.
  - **Kibana's dashboard controls:** options lists and range sliders.
  - **Vega in Kibana's map mode:** it needs map tiles.
- **Maps.**
  - Road tiles and boundary files should come from Elastic Maps Service at runtime, the way Kibana Maps gets them: through the maps plugin's EMS client and settings, `map.emsUrl` and offline or self-hosted setups included. Nothing is vendored into the repository.
    - That means passing EMS boundary files to `defineMapsPack({ geometry })` in the plugin's server drawing.
    - Road tiles additionally need EMS's vector tiles turned into something the static renderer can draw, which is the larger part.
    - Where EMS is unreachable, the pack keeps its fallback: country outlines and no road tiles.
    - Until then, only `world_countries` is available, as a Maps test fixture.
  - The pack draws Web Mercator; Kibana draws these zooms on a globe.
  - Gaps against Kibana's styling:
    - a cluster's outline color;
    - a label's number format (Kibana prints `$16,723.8`);
    - label size by value;
    - only regions with joined values being drawn.
  - The node holds one region set and one marker layer.
- **Server drawing.**
  - The packaged worker path (`node_worker.js` beside the host file) is unverified without a distributable build.
  - `@napi-rs/canvas` and `@takumi-rs/core` install only the host platform's binaries.
  - An Elastic Charts selector cache leaks about 2 KB per chart in the worker.
  - Elastic Charts logs a contrast warning for every chart drawn on a transparent background.
