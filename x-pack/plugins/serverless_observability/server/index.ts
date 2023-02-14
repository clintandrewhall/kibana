import { PluginInitializerContext } from '@kbn/core/server';
import { ServerlessObservabilityPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new ServerlessObservabilityPlugin(initializerContext);
}

export type {
  ServerlessObservabilityPluginSetup,
  ServerlessObservabilityPluginStart,
} from './types';
