/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * Dependency Cruiser Configuration for Kibana Plugin Architecture Analysis
 *
 * This configuration enforces architectural rules for the Kibana plugin ecosystem,
 * providing visibility into the dependency graph and validating plugin boundaries.
 *
 * Key Rules:
 * 1. No circular dependencies
 * 2. Enforce public API boundaries (plugins must not import internal files from other plugins)
 * 3. Private plugins cannot be imported by solution plugins
 * 4. Platform plugins layering rules
 * 5. Detection of orphan modules
 *
 * Usage:
 *   # Validate dependencies
 *   yarn deps:validate
 *
 *   # Generate visualization
 *   yarn deps:graph
 *
 *   # Analyze specific plugin
 *   yarn deps:analyze --focus "^src/platform/plugins/shared/dashboard"
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    /* ============================================================================
     * RULE: No Circular Dependencies
     * ============================================================================
     * Circular dependencies create tight coupling and make it impossible to
     * build or test plugins in isolation. They also cause issues with code
     * splitting and lazy loading.
     */
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Circular dependencies create tight coupling and prevent independent plugin development. ' +
        'Refactor to break the cycle by extracting shared types to a common package.',
      from: {},
      to: {
        circular: true,
      },
    },

    /* ============================================================================
     * RULE: No Orphan Modules
     * ============================================================================
     * Orphan modules are files that are not imported by any other module.
     * This may indicate dead code or forgotten files.
     */
    {
      name: 'no-orphans',
      severity: 'warn',
      comment:
        'This module is not imported by any other module. It may be dead code that should be removed, ' +
        'or it may need to be integrated into the codebase.',
      from: {
        orphan: true,
        pathNot: [
          // Entry points
          '(^|/)index\\.[jt]sx?$',
          '(^|/)plugin\\.[jt]sx?$',
          '(^|/)public/index\\.[jt]sx?$',
          '(^|/)server/index\\.[jt]sx?$',
          // Test files
          '\\.test\\.[jt]sx?$',
          '\\.spec\\.[jt]sx?$',
          '\\.stories\\.[jt]sx?$',
          '/__tests__/',
          '/__mocks__/',
          '/__fixtures__/',
          '/test/',
          '/tests/',
          '/mock/',
          '/mocks/',
          '/e2e/',
          '/ftr/',
          // Config files
          '\\.config\\.[jt]s$',
          'jest\\.config\\.[jt]s$',
          'tsconfig\\.json$',
          'kibana\\.jsonc$',
          // Type definitions
          '\\.d\\.ts$',
          '/types/',
          // Scripts
          '^scripts/',
          // Storybook
          '\\.storybook/',
        ],
      },
      to: {},
    },

    /* ============================================================================
     * RULE: Enforce Plugin Public API Boundaries
     * ============================================================================
     * Plugins must only import from other plugins through their public API
     * entry points (public/index.ts, server/index.ts). Direct imports of
     * internal files create brittle dependencies that break encapsulation.
     */
    {
      name: 'plugin-public-api-only',
      severity: 'error',
      comment:
        'Plugins must only import from other plugins through their public API (public/index or server/index). ' +
        'Direct imports of internal files break encapsulation. Export the needed functionality through the public API.',
      from: {
        path: '^(src/platform/plugins|x-pack/(platform|solutions)/.*?/plugins)/([^/]+)',
      },
      to: {
        path: '^(src/platform/plugins|x-pack/(platform|solutions)/.*?/plugins)/([^/]+)/',
        pathNot: [
          // Allow imports from own plugin
          '^$1/$3/',
          // Allow imports through public entry points
          '/public/index\\.[jt]sx?$',
          '/server/index\\.[jt]sx?$',
          '/common/index\\.[jt]sx?$',
          // Allow imports of types packages
          '^@kbn/.*-types',
        ],
      },
    },

    /* ============================================================================
     * RULE: Private Plugins Cannot be Imported by Other Plugins
     * ============================================================================
     * Plugins in src/platform/plugins/private are internal implementation
     * details and should not be directly imported by other plugins.
     */
    {
      name: 'no-import-private-plugins',
      severity: 'warn',
      comment:
        'Private plugins (src/platform/plugins/private) are internal implementation details. ' +
        'Consider using a shared plugin or package instead, or move the functionality to a shared location.',
      from: {
        path: '^(src/platform/plugins/shared|x-pack)',
      },
      to: {
        path: '^src/platform/plugins/private/',
      },
    },

    /* ============================================================================
     * RULE: Solution Plugins Cannot Depend on Other Solution Plugins
     * ============================================================================
     * Solution-specific plugins (observability, security, search) should not
     * directly depend on plugins from other solutions. They should only
     * depend on platform plugins or shared packages.
     */
    {
      name: 'no-cross-solution-dependencies',
      severity: 'error',
      comment:
        'Solution plugins should not depend on plugins from other solutions. ' +
        'Extract shared functionality to a platform plugin or package.',
      from: {
        path: '^x-pack/solutions/(observability|security|search|workplaceai)/plugins/',
      },
      to: {
        path: '^x-pack/solutions/(observability|security|search|workplaceai)/plugins/',
        pathNot: [
          // Allow dependencies within the same solution
          '^x-pack/solutions/$1/plugins/',
        ],
      },
    },

    /* ============================================================================
     * RULE: No Direct Node Modules Import Without Declaration
     * ============================================================================
     * Dependencies should be declared in package.json. This catches transitive
     * dependencies that might disappear during updates.
     */
    {
      name: 'no-undeclared-dependencies',
      severity: 'warn',
      comment:
        'This module uses a dependency that is not declared in package.json. ' +
        'Add it to dependencies to prevent breakage when transitive dependencies change.',
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
        pathNot: [
          // Ignore workspace packages
          '^@kbn/',
          '^@elastic/',
        ],
      },
    },

    /* ============================================================================
     * RULE: No Deprecated Dependencies
     * ============================================================================
     * Warn about using deprecated packages.
     */
    {
      name: 'no-deprecated-dependencies',
      severity: 'info',
      comment:
        'This module uses a deprecated package. Consider migrating to a replacement.',
      from: {},
      to: {
        dependencyTypes: ['deprecated'],
      },
    },

    /* ============================================================================
     * RULE: Do Not Reach Into Internal Node Modules
     * ============================================================================
     * Importing directly from the internals of node_modules packages is
     * fragile as these paths may change without notice.
     */
    {
      name: 'no-internal-node-module-imports',
      severity: 'warn',
      comment:
        'Do not import from internal paths of node_modules packages. ' +
        'These paths are not part of the public API and may change.',
      from: {},
      to: {
        path: 'node_modules/(?!(@kbn|@elastic)/)',
        pathNot: [
          // Allow common internal imports that are known to be stable
          'node_modules/[^/]+/(?:dist|lib|src|es|esm|cjs)/index',
          'node_modules/[^/]+/(?:package\\.json)$',
        ],
      },
    },

    /* ============================================================================
     * RULE: Server Code Cannot Import Browser Code
     * ============================================================================
     * Server-side code should not import browser-specific modules.
     */
    {
      name: 'no-server-importing-browser',
      severity: 'error',
      comment:
        'Server-side code cannot import browser-specific modules. ' +
        'Move shared functionality to common/ or create separate implementations.',
      from: {
        path: '/server/',
      },
      to: {
        path: '/public/',
        pathNot: [
          // Allow imports from common
          '/common/',
        ],
      },
    },

    /* ============================================================================
     * RULE: Browser Code Cannot Import Server Code
     * ============================================================================
     * Browser-side code should not import server-specific modules.
     */
    {
      name: 'no-browser-importing-server',
      severity: 'error',
      comment:
        'Browser-side code cannot import server-specific modules. ' +
        'Move shared functionality to common/ or create separate implementations.',
      from: {
        path: '/public/',
      },
      to: {
        path: '/server/',
        pathNot: [
          // Allow imports from common
          '/common/',
        ],
      },
    },

    /* ============================================================================
     * RULE: Detect Potential Implicit uiActions Dependencies
     * ============================================================================
     * This is an informational rule to help identify plugins that use
     * uiActions registry patterns which create implicit dependencies.
     */
    {
      name: 'detect-ui-actions-usage',
      severity: 'info',
      comment:
        'This module uses uiActions which may create implicit runtime dependencies. ' +
        'Consider documenting these dependencies in the plugin manifest.',
      from: {},
      to: {
        path: '@kbn/ui-actions',
      },
    },

    /* ============================================================================
     * RULE: Detect Potential Implicit Expressions Dependencies
     * ============================================================================
     * Similar to uiActions, expressions plugin creates runtime registries
     * that result in implicit dependencies.
     */
    {
      name: 'detect-expressions-usage',
      severity: 'info',
      comment:
        'This module uses expressions which may create implicit runtime dependencies. ' +
        'Consider documenting these dependencies in the plugin manifest.',
      from: {},
      to: {
        path: '@kbn/expressions',
      },
    },
  ],

  /* ============================================================================
   * Options
   * ============================================================================
   */
  options: {
    // Do not follow imports to node_modules (makes analysis faster)
    doNotFollow: {
      path: 'node_modules',
    },

    // Exclude certain paths from analysis
    exclude: {
      path: [
        // Test files
        '__tests__',
        '__mocks__',
        '__fixtures__',
        '\\.test\\.[jt]sx?$',
        '\\.spec\\.[jt]sx?$',
        '\\.stories\\.[jt]sx?$',
        '/test/',
        '/tests/',
        '/e2e/',
        '/ftr/',
        '/functional/',
        '/integration_tests/',
        // Build artifacts
        '/target/',
        '/build/',
        '/dist/',
        // Config files
        '\\.config\\.[jt]s$',
        'jest\\.config\\.[jt]s$',
        // Generated files
        '\\.d\\.ts$',
        '/generated/',
        // Storybook
        '\\.storybook/',
      ],
    },

    // Include only TypeScript and JavaScript files
    includeOnly: {
      path: '\\.[jt]sx?$',
    },

    // Module resolution settings matching Kibana's tsconfig
    tsPreCompilationDeps: true,

    // Enhanced module resolution
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    // TypeScript configuration
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },

    // Report settings for different output formats
    reporterOptions: {
      dot: {
        theme: {
          graph: {
            rankdir: 'TB',
            splines: 'ortho',
          },
          node: {
            fontsize: '10',
          },
          edge: {
            fontsize: '8',
          },
          modules: [
            {
              criteria: { source: '^src/platform/plugins/shared' },
              attributes: { fillcolor: '#e8f4ea', style: 'filled' },
            },
            {
              criteria: { source: '^src/platform/plugins/private' },
              attributes: { fillcolor: '#ffeaa7', style: 'filled' },
            },
            {
              criteria: { source: '^x-pack/platform/plugins' },
              attributes: { fillcolor: '#dfe6e9', style: 'filled' },
            },
            {
              criteria: { source: '^x-pack/solutions/observability' },
              attributes: { fillcolor: '#a29bfe', style: 'filled' },
            },
            {
              criteria: { source: '^x-pack/solutions/security' },
              attributes: { fillcolor: '#fd79a8', style: 'filled' },
            },
            {
              criteria: { source: '^x-pack/solutions/search' },
              attributes: { fillcolor: '#81ecec', style: 'filled' },
            },
          ],
          dependencies: [
            {
              criteria: { valid: false },
              attributes: { color: '#e74c3c', style: 'bold' },
            },
            {
              criteria: { circular: true },
              attributes: { color: '#9b59b6', style: 'bold', penwidth: '2' },
            },
          ],
        },
      },
      archi: {
        theme: {
          graph: {
            rankdir: 'TB',
            splines: 'ortho',
          },
        },
        collapsePattern: [
          // Collapse to plugin level for high-level view
          '^(src/platform/plugins/(shared|private)/[^/]+)',
          '^(x-pack/platform/plugins/(shared|private)/[^/]+)',
          '^(x-pack/solutions/[^/]+/plugins/[^/]+)',
          // Collapse packages
          '^(packages/[^/]+)',
          '^(src/platform/packages/[^/]+/[^/]+)',
          '^(x-pack/platform/packages/[^/]+/[^/]+)',
        ],
      },
      html: {
        showMetricsSummary: true,
        theme: 'monokai',
      },
    },

    // Cache settings for faster subsequent runs
    cache: {
      folder: 'node_modules/.cache/dependency-cruiser',
      strategy: 'metadata',
    },

    // Progress indicator
    progress: {
      type: 'performance-log',
    },
  },
};
