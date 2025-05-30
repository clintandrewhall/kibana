/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreSetup } from '@kbn/core/server';

export class Plugin {
  constructor() {}

  public setup(core: CoreSetup) {
    // called when plugin is setting up during Kibana's startup sequence
    core.savedObjects.registerType<{ title: string }>({
      name: 'sharedtype',
      hidden: false,
      namespaceType: 'multiple',
      management: {
        icon: 'beaker',
        importableAndExportable: true,
        getTitle(obj) {
          return obj.attributes.title;
        },
      },
      mappings: {
        properties: {
          title: { type: 'text' },
        },
      },
    });
    core.savedObjects.registerType<{ title: string }>({
      name: 'isolatedtype',
      hidden: false,
      namespaceType: 'single',
      management: {
        icon: 'beaker',
        importableAndExportable: true,
        getTitle(obj) {
          return obj.attributes.title;
        },
      },
      mappings: {
        properties: {
          title: { type: 'text' },
        },
      },
    });
  }

  public start() {
    // called after all plugins are set up
  }

  public stop() {
    // called when plugin is torn down during Kibana's shutdown sequence
  }
}
