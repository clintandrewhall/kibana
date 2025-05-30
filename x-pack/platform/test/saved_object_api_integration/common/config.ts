/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import path from 'path';
import { FtrConfigProviderContext } from '@kbn/test';
import { ScoutTestRunConfigCategory } from '@kbn/scout-info';

import { services } from './services';

interface CreateTestConfigOptions {
  license: string;
  disabledPlugins?: string[];
}

export function createTestConfig(name: string, options: CreateTestConfigOptions) {
  const { license = 'trial', disabledPlugins = [] } = options;

  return async ({ readConfigFile }: FtrConfigProviderContext) => {
    const config = {
      kibana: {
        api: await readConfigFile(require.resolve('@kbn/test-suites-src/api_integration/config')),
        functional: await readConfigFile(
          require.resolve('@kbn/test-suites-src/functional/config.base')
        ),
      },
      xpack: {
        api: await readConfigFile(require.resolve('../../api_integration/config.ts')),
      },
    };

    return {
      testConfigCategory: ScoutTestRunConfigCategory.API_TEST,
      testFiles: [require.resolve(`../${name}/apis/`)],
      servers: config.xpack.api.get('servers'),
      services,
      junit: {
        reportName: 'X-Pack Saved Object API Integration Tests -- ' + name,
      },
      esTestCluster: {
        ...config.xpack.api.get('esTestCluster'),
        license,
        serverArgs: [
          `xpack.license.self_generated.type=${license}`,
          `xpack.security.enabled=${!disabledPlugins.includes('security')}`,
        ],
      },

      kbnTestServer: {
        ...config.xpack.api.get('kbnTestServer'),
        serverArgs: [
          ...config.xpack.api.get('kbnTestServer.serverArgs'),
          '--server.xsrf.disableProtection=true',
          `--plugin-path=${path.resolve(__dirname, 'plugins/saved_object_test_plugin')}`,
          ...disabledPlugins
            .filter((k) => k !== 'security')
            .map((key) => `--xpack.${key}.enabled=false`),
        ],
      },
    };
  };
}
