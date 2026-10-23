/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { type ChildNodeWalker, type Composition, createChildNodeWalker } from '@elastic/isomer-sdk';

import { examples } from '../charts/xy_chart/examples';

import { type PreparedCharts, prepareCharts, readArtifact } from './artifacts';
import { composeEngines } from './compose';
import type { ChartArtifact, ChartEngine, ChartNode, DrawRequest } from './types';

const chart = examples[0] as unknown as ChartNode;

/** A walker that knows one container, `group`, holding `items`. */
const walk: ChildNodeWalker = createChildNodeWalker([
  {
    type: 'group',
    children: (node: { items: unknown[] }) =>
      node.items.map((item, index) => ({
        node: item,
        path: `items[${index}]`,
      })),
  },
]);

const artifact = (label: string): ChartArtifact => ({
  plot: { kind: 'svg', markup: `<svg>${label}</svg>` },
  width: 100,
  height: 50,
  legend: [],
});

const stubEngine = (
  draw: (node: ChartNode, request: DrawRequest) => ChartArtifact | Promise<ChartArtifact>
): ChartEngine & { calls: DrawRequest[] } => {
  const calls: DrawRequest[] = [];
  return {
    id: 'stub',
    version: '1',
    supports: {
      xyChart: { fidelity: 'native', selection: { live: true, static: false } },
    },
    calls,
    draw: (node, request) => {
      calls.push(request);
      return draw(node, request);
    },
  };
};

const view = (...body: unknown[]): Composition =>
  ({ type: 'view', body } as unknown as Composition);

/** What a renderer inside `prepared.render` reads for `node`. */
const readDuring = (
  { render }: PreparedCharts,
  engine: ChartEngine,
  node: ChartNode,
  mode: 'light' | 'dark' = 'light'
) => render(() => readArtifact(engine, node, mode));

describe('prepareCharts', () => {
  it('draws each chart once, holds it until release, and reads it back by content', async () => {
    const engine = stubEngine(() => artifact('a'));
    const prepared = await prepareCharts(engine, view(chart, chart), {
      walk,
      mode: 'light',
      width: 600,
    });
    expect(engine.calls).toHaveLength(1);
    expect(engine.calls[0]).toMatchObject({
      mode: 'light',
      width: 600,
      height: 320,
    });
    // A validated copy with its keys in another order is the same chart.
    const reordered = Object.fromEntries(
      Object.entries(chart as object).reverse()
    ) as unknown as ChartNode;
    expect(readDuring(prepared, engine, reordered)).toEqual(artifact('a'));
    expect(readDuring(prepared, engine, chart, 'dark')).toBeUndefined();
    // Outside a render, no drawing is read.
    expect(readArtifact(engine, chart, 'light')).toBeUndefined();
    prepared.release();
    expect(readDuring(prepared, engine, chart)).toBeUndefined();
  });

  it('finds charts inside another pack’s containers', async () => {
    const engine = stubEngine(() => artifact('nested'));
    const prepared = await prepareCharts(engine, view({ type: 'group', items: [chart] }), {
      walk,
      mode: 'dark',
      width: 300,
    });
    expect(readDuring(prepared, engine, chart, 'dark')).toEqual(artifact('nested'));
  });

  it('sizes and hints each chart from its containers and content', async () => {
    const engine = stubEngine(() => artifact('a'));
    const panel = { type: 'group', size: { width: 300, height: 120 }, items: [chart] };
    const { release } = await prepareCharts(engine, view(panel), {
      walk,
      mode: 'light',
      width: 600,
      sizeFor: (_node, ancestors) => (ancestors[0] as unknown as typeof panel | undefined)?.size,
      hintFor: () => ({ legend: { show: false } }),
    });
    expect(engine.calls).toEqual([
      expect.objectContaining({ width: 300, height: 120, hint: { legend: { show: false } } }),
    ]);
    release();
  });

  it('keeps a drawing two overlapping calls share until both release', async () => {
    let finish: (value: ChartArtifact) => void = () => undefined;
    const engine = stubEngine(() => new Promise<ChartArtifact>((resolve) => (finish = resolve)));
    const options = { walk, mode: 'light', width: 600 } as const;
    const first = prepareCharts(engine, view(chart), options);
    const second = prepareCharts(engine, view(chart), options);
    while (engine.calls.length === 0) {
      await Promise.resolve();
    }
    finish(artifact('shared'));
    const [a, b] = await Promise.all([first, second]);
    expect(engine.calls).toHaveLength(1);
    a.release();
    expect(readDuring(b, engine, chart)).toEqual(artifact('shared'));
    b.release();
    expect(readDuring(b, engine, chart)).toBeUndefined();
  });

  it('draws overlapping calls at their own sizes and hints, and each render reads its own', async () => {
    const engine = stubEngine((_node, { width, hint }) =>
      artifact(`${width}${hint === undefined ? '' : JSON.stringify(hint)}`)
    );
    const hint = { legend: { show: false } };
    const [wide, narrow, hinted] = await Promise.all([
      prepareCharts(engine, view(chart), { walk, mode: 'light', width: 900 }),
      prepareCharts(engine, view(chart), { walk, mode: 'light', width: 300 }),
      prepareCharts(engine, view(chart), { walk, mode: 'light', width: 300, hintFor: () => hint }),
    ]);
    expect(engine.calls.map(({ width }) => width)).toEqual([900, 300, 300]);
    expect(readDuring(wide, engine, chart)).toEqual(artifact('900'));
    expect(readDuring(narrow, engine, chart)).toEqual(artifact('300'));
    expect(readDuring(hinted, engine, chart)).toEqual(artifact(`300${JSON.stringify(hint)}`));
    wide.release();
    expect(readDuring(narrow, engine, chart)).toEqual(artifact('300'));
    narrow.release();
    hinted.release();
  });

  it('draws a chart that appears twice in one composition once, at its first size', async () => {
    const engine = stubEngine((_node, { width }) => artifact(String(width)));
    const panel = (width: number) => ({
      type: 'group',
      size: { width, height: 120 },
      items: [chart],
    });
    const prepared = await prepareCharts(engine, view(panel(300), panel(500)), {
      walk,
      mode: 'light',
      width: 600,
      sizeFor: (_node, ancestors) =>
        (ancestors[0] as unknown as { size: { width: number; height: number } }).size,
    });
    expect(engine.calls.map(({ width }) => width)).toEqual([300]);
    expect(readDuring(prepared, engine, chart)).toEqual(artifact('300'));
    prepared.release();
  });

  it('leaves a chart whose drawing fails to its fallback, without failing the call', async () => {
    const engine = stubEngine(() => {
      throw new Error('no canvas');
    });
    const prepared = await prepareCharts(engine, view(chart), { walk, mode: 'light', width: 600 });
    expect(readDuring(prepared, engine, chart)).toBeUndefined();
  });

  it('separates engines and versions', async () => {
    const one = stubEngine(() => artifact('one'));
    const other = { ...stubEngine(() => artifact('other')), version: '2' };
    const prepared = await prepareCharts(one, view(chart), { walk, mode: 'light', width: 600 });
    expect(readDuring(prepared, one, chart)).toEqual(artifact('one'));
    expect(readDuring(prepared, other, chart)).toBeUndefined();
  });

  it('draws nothing for an engine without `draw` or a type it does not support', async () => {
    const live: ChartEngine = { id: 'live', version: '1', supports: {} };
    const prepared = await prepareCharts(live, view(chart), { walk, mode: 'light', width: 600 });
    expect(readDuring(prepared, live, chart)).toBeUndefined();
    const narrow = { ...stubEngine(() => artifact('x')), supports: {} };
    await prepareCharts(narrow, view(chart), {
      walk,
      mode: 'light',
      width: 600,
    });
    expect(narrow.calls).toHaveLength(0);
  });
});

describe('composeEngines', () => {
  const engine = (id: string, supports: ChartEngine['supports']): ChartEngine => ({
    id,
    version: '1',
    supports,
    draw: () => artifact(id),
  });
  const native = {
    fidelity: 'native',
    selection: { live: true, static: true },
  } as const;
  const approximate = { ...native, fidelity: 'approximate' } as const;

  it('takes each type from the first native engine, else the first approximate one', async () => {
    const composed = composeEngines(
      engine('ec', { donut: approximate, xyChart: native }),
      engine('echarts', {
        donut: native,
        xyChart: native,
        heatmap: approximate,
      })
    );
    expect(composed.supports).toEqual({
      donut: native,
      xyChart: native,
      heatmap: approximate,
    });
    const drawn = await composed.draw!(chart, {
      mode: 'light',
      width: 1,
      height: 1,
      theme: undefined as never,
    });
    expect(drawn).toEqual(artifact('ec'));
    expect(composed.version).toBe('ec@1+echarts@1');
  });
});
