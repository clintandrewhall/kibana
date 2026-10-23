/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { bindChartsDashboard } from './bind_charts';
import { planDashboard } from './dashboard';

const LOGS = 'edf84fe0-e1a0-11e7-b6d5-4dc382ef7f5b';

/** The web logs sample, with a range filter saved on its ES|QL metric, panel `11`. */
const withSavedFilter = (): string =>
  readFileSync(join(__dirname, '../fixtures/web_logs_sample.ndjson'), 'utf8')
    .trim()
    .split('\n')
    .map((line) => {
      const object = JSON.parse(line);
      if (object.type === 'dashboard' && object.id === LOGS) {
        const panels = JSON.parse(object.attributes.panelsJSON);
        panels.find(
          ({ panelIndex }: { panelIndex: string }) => panelIndex === '11'
        ).embeddableConfig.attributes.state.filters = [
          {
            meta: { type: 'range', key: 'bytes', params: { gte: 100 } },
            query: { range: { bytes: { gte: 100 } } },
          },
        ];
        object.attributes.panelsJSON = JSON.stringify(panels);
      }
      return JSON.stringify(object);
    })
    .join('\n');

describe('bindChartsDashboard', () => {
  it('refuses a panel whose filters apply as DSL when no executor applies them', async () => {
    const planned = planDashboard(withSavedFilter(), LOGS, { dashboardContext: 'dsl' });
    const { panels } = await bindChartsDashboard(planned, async () => ({
      columns: [],
      values: [],
    }));
    expect(panels.find(({ panelId }) => panelId === '11')?.outcome).toEqual({
      status: 'refused',
      nodeType: 'metric',
      reasons: ['its query and filters apply as DSL, and no executor applies them'],
    });
  });
});
