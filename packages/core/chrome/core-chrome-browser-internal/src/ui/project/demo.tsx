/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const createItem = (name: string, data = {}) => {
  // NOTE: Duplicate `name` values will cause `id` collisions.
  return {
    id: name,
    name,
    // isSelected: selectedItemName === name,
    isSelected: name === 'Discover',
    // onClick: () => selectItem(name),
    onClick: () => {},
    ...data,
  };
};

export const sideNav = [
  createItem('', {
    id: 'Uncategorized',
    items: [
      createItem('Home'),
      createItem('Alerts'),
      createItem('Cases'),
      createItem('Data exploration', {
        onClick: undefined,
        forceOpen: false,
        items: [
          createItem('Discover'),
          createItem('Dashboards'),
          createItem('Machine Learning'),
          createItem('Visualize Library'),
        ],
      }),
      createItem('Logs', {
        onClick: undefined,
        forceOpen: false,
        items: [createItem('Stream'), createItem('Anomalies'), createItem('Categories')],
      }),
      createItem('Infrastructure', {
        onClick: undefined,
        forceOpen: false,
        items: [createItem('Inventory'), createItem('Metrics Explorer')],
      }),
      createItem('APM', {
        onClick: undefined,
        forceOpen: false,
        items: [createItem('Services'), createItem('Traces'), createItem('Dependencies')],
      }),
      createItem('Uptime', {
        onClick: undefined,
        forceOpen: false,
        items: [createItem('Monitors'), createItem('TLS Certificates')],
      }),
      createItem('User Experience'),
      createItem('Machine Learning', {
        onClick: undefined,
        forceOpen: false,
        items: [
          createItem('Anomaly Detection', {
            onClick: undefined,
            forceOpen: false,
            items: [
              createItem('Jobs'),
              createItem('Anomaly Explorer'),
              createItem('Single Metric Viewer'),
              createItem('Settings'),
            ],
          }),
          createItem('Data Frame Analytics', {
            onClick: undefined,
            forceOpen: false,
            items: [
              createItem('Jobs'),
              createItem('Results Explorer'),
              createItem('Analytics Map'),
            ],
          }),
          createItem('Model Management', {
            onClick: undefined,
            forceOpen: false,
            items: [createItem('Trained Models'), createItem('Nodes')],
          }),
          createItem('Data Visualizer', {
            onClick: undefined,
            forceOpen: false,
            items: [createItem('File'), createItem('Data View')],
          }),
          createItem('AIOps', {
            onClick: undefined,
            forceOpen: false,
            items: [createItem('Explain Log Rate Spikes')],
          }),
        ],
      }),
      createItem('Management', {
        onClick: undefined,
        forceOpen: false,
        items: [
          createItem('Dev Tools'),
          createItem('Integrations'),
          createItem('Fleet'),
          createItem('Ingest', {
            onClick: undefined,
            forceOpen: false,
            items: [createItem('Ingest Pipelines'), createItem('Logstash Pipelines')],
          }),
          createItem('Data', {
            onClick: undefined,
            forceOpen: false,
            items: [
              createItem('Index Management'),
              createItem('Index Lifecycle Policies'),
              createItem('Snapshot and Restore'),
              createItem('Transforms'),
              createItem('Remote Clusters'),
            ],
          }),
          createItem('Alerts and Insights', {
            onClick: undefined,
            forceOpen: false,
            items: [createItem('Connectors'), createItem('Reporting')],
          }),
          createItem('Security', {
            onClick: undefined,
            forceOpen: false,
            items: [createItem('Users'), createItem('Roles')],
          }),
          createItem('Kibana', {
            onClick: undefined,
            forceOpen: false,
            items: [createItem('Data Views'), createItem('Saved Objects'), createItem('Tags')],
          }),
        ],
      }),
    ],
  }),
];
