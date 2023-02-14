import { ObservabilityPublicSetup } from '@kbn/observability-plugin/public';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServerlessObservabilityPluginSetup {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServerlessObservabilityPluginStart {}

export interface AppPluginSetupDependencies {
  observability: ObservabilityPublicSetup;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppPluginStartDependencies {}
