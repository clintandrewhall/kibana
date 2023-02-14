import { PluginInitializerContext, Plugin } from '@kbn/core/server';

import { ServerlessObservabilityPluginSetup, ServerlessObservabilityPluginStart } from './types';

export class ServerlessObservabilityPlugin
  implements Plugin<ServerlessObservabilityPluginSetup, ServerlessObservabilityPluginStart>
{
  constructor(initializerContext: PluginInitializerContext) {}

  public setup() {
    return {};
  }

  public start() {
    return {};
  }

  public stop() {}
}
