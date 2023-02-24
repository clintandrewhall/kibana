import { ServerlessObservabilityPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new ServerlessObservabilityPlugin();
}

export type {
  ServerlessObservabilityPluginSetup,
  ServerlessObservabilityPluginStart,
} from './types';
