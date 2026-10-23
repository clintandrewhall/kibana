# @kbn/isomer-primitives-charts

Chart primitives for Isomer: `xyChart`, `donut`, `treemap`, `heatmap`, `metricTrend`, and `gauge`, with their schemas, catalog, examples, and validation. It depends on `@elastic/isomer-sdk` and `@elastic/distillate` alone.

`chartsPack` draws no charts: on every surface, a chart renders as its title, description, a one-sentence summary, and its data table.

```ts
import { chartsPack } from '@kbn/isomer-primitives-charts';

createKibanaIsomerRuntime({ packs: [chartsPack] });
```

`defineChartsPack(engine)` draws charts through a `ChartEngine` (`src/engine/types.ts`). `@kbn/isomer-charts-elastic` is the engine for Elastic Charts.

- With `render: 'live'`, the engine's components mount in a client-side React tree.
- With `render: 'static'`, the default, `prepareCharts` draws each chart ahead of a static surface render. The surface renders inside that call's `render`, so it reads the drawings the call made, at its size and mode.
- A chart the engine doesn't support, or whose drawing failed, keeps its summary and data table, which stay the accessible reading of every drawn chart too.

```ts
const runtime = createKibanaIsomerRuntime({ packs: [defineChartsPack(engine)] });
const walk = createChildNodeWalker(runtime.primitives);
const prepared = await prepareCharts(engine, composition, { walk, mode: 'light', width: 600 });
try {
  const { html } = prepared.render(() => runtime.surfaces.html.render(composition));
} finally {
  prepared.release();
}
```

## Plans

- Raise each chart's `selection` event from static drawings. Live charts raise it on a click; an artifact's `hitMap` is typed, but no engine draws one and no surface reads it yet.
- Take colors from `@kbn/isomer-theme` instead of the Borealis literals in `src/theme/tokens.ts`.
