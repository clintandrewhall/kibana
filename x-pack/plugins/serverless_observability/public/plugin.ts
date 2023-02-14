import { CoreSetup, CoreStart, Plugin } from '@kbn/core/public';
import {
  ServerlessObservabilityPluginSetup,
  ServerlessObservabilityPluginStart,
  AppPluginSetupDependencies,
} from './types';

export class ServerlessObservabilityPlugin
  implements Plugin<ServerlessObservabilityPluginSetup, ServerlessObservabilityPluginStart>
{
  public setup(
    _core: CoreSetup,
    setupDeps: AppPluginSetupDependencies
  ): ServerlessObservabilityPluginSetup {
    setupDeps.observability.navigation.setIsSidebarEnabled(false);

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart): ServerlessObservabilityPluginStart {
    core.chrome.setChromeStyle('project');
    return {};
  }

  public stop() {}
}
