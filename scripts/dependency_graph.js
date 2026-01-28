/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * Kibana Dependency Graph Analysis Script
 *
 * This script provides comprehensive dependency analysis for the Kibana plugin architecture.
 * It wraps dependency-cruiser with Kibana-specific defaults and provides multiple output formats.
 *
 * Usage:
 *   node scripts/dependency_graph.js [options]
 *
 * Examples:
 *   # Validate all plugin dependencies
 *   node scripts/dependency_graph.js --validate
 *
 *   # Generate HTML visualization for all plugins
 *   node scripts/dependency_graph.js --output-type html --output-to reports/dependency-graph.html
 *
 *   # Analyze a specific plugin
 *   node scripts/dependency_graph.js --focus "^src/platform/plugins/shared/dashboard" --output-type html
 *
 *   # Generate DOT format for custom visualization
 *   node scripts/dependency_graph.js --output-type dot --output-to reports/graph.dot
 */

require('@kbn/setup-node-env');

const { run } = require('@kbn/dev-cli-runner');
const { createFailError } = require('@kbn/dev-cli-errors');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_CONFIG = path.join(REPO_ROOT, '.dependency-cruiser.cjs');
const DEFAULT_OUTPUT_DIR = path.join(REPO_ROOT, 'reports', 'dependency-analysis');

// Default paths to analyze (main plugin directories)
const DEFAULT_PATHS = [
  'src/platform/plugins/shared',
  'src/platform/plugins/private',
  'x-pack/platform/plugins',
  'x-pack/solutions',
];

// Smaller path sets for targeted analysis
const PATH_PRESETS = {
  platform: ['src/platform/plugins/shared', 'src/platform/plugins/private'],
  'x-pack': ['x-pack/platform/plugins'],
  observability: ['x-pack/solutions/observability/plugins'],
  security: ['x-pack/solutions/security/plugins'],
  search: ['x-pack/solutions/search/plugins'],
  all: DEFAULT_PATHS,
};

run(
  async ({ log, flags }) => {
    const {
      validate,
      outputType,
      outputTo,
      focus,
      preset,
      paths: customPaths,
      config,
      includeNodeModules,
      maxDepth,
      collapsePattern,
      help,
    } = flags;

    if (help) {
      printHelp();
      return;
    }

    // Ensure output directory exists
    if (!fs.existsSync(DEFAULT_OUTPUT_DIR)) {
      fs.mkdirSync(DEFAULT_OUTPUT_DIR, { recursive: true });
    }

    // Determine which paths to analyze
    let pathsToAnalyze = DEFAULT_PATHS;
    if (customPaths && customPaths.length > 0) {
      pathsToAnalyze = Array.isArray(customPaths) ? customPaths : [customPaths];
    } else if (preset && PATH_PRESETS[preset]) {
      pathsToAnalyze = PATH_PRESETS[preset];
    }

    // Verify paths exist
    const validPaths = pathsToAnalyze.filter((p) => {
      const fullPath = path.join(REPO_ROOT, p);
      if (!fs.existsSync(fullPath)) {
        log.warning(`Path does not exist: ${p}`);
        return false;
      }
      return true;
    });

    if (validPaths.length === 0) {
      throw createFailError('No valid paths to analyze');
    }

    // Build dependency-cruiser command
    const configPath = config || DEFAULT_CONFIG;
    if (!fs.existsSync(configPath)) {
      throw createFailError(`Configuration file not found: ${configPath}`);
    }

    const args = ['npx', 'dependency-cruiser'];

    // Add configuration
    args.push('--config', configPath);

    // Add output type
    const effectiveOutputType = outputType || (validate ? 'err' : 'html');
    args.push('--output-type', effectiveOutputType);

    // Add output file
    if (outputTo) {
      args.push('--output-to', outputTo);
    } else if (effectiveOutputType !== 'err' && effectiveOutputType !== 'text') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const extension = getExtensionForOutputType(effectiveOutputType);
      const defaultOutput = path.join(
        DEFAULT_OUTPUT_DIR,
        `dependency-graph-${timestamp}.${extension}`
      );
      args.push('--output-to', defaultOutput);
      log.info(`Output will be written to: ${defaultOutput}`);
    }

    // Add focus filter if specified
    if (focus) {
      args.push('--focus', focus);
    }

    // Add max depth
    if (maxDepth) {
      args.push('--max-depth', String(maxDepth));
    }

    // Add collapse pattern for high-level view
    if (collapsePattern) {
      args.push('--collapse', collapsePattern);
    }

    // Add paths to analyze
    args.push(...validPaths);

    log.info(`Analyzing dependencies in: ${validPaths.join(', ')}`);
    log.debug(`Running: ${args.join(' ')}`);

    try {
      const result = spawnSync(args[0], args.slice(1), {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=8192',
        },
      });

      if (result.error) {
        throw result.error;
      }

      if (result.status !== 0) {
        if (validate) {
          throw createFailError(
            'Dependency validation failed. See errors above for details.'
          );
        }
        log.warning('Dependency analysis completed with warnings.');
      } else {
        log.success('Dependency analysis completed successfully.');
      }
    } catch (error) {
      throw createFailError(`Failed to run dependency-cruiser: ${error.message}`);
    }
  },
  {
    description: 'Analyze and visualize Kibana plugin dependencies',
    usage: `
      node scripts/dependency_graph.js [options]
    `,
    flags: {
      boolean: ['validate', 'help', 'includeNodeModules'],
      string: ['outputType', 'outputTo', 'focus', 'preset', 'config', 'maxDepth', 'collapsePattern'],
      array: ['paths'],
      default: {
        validate: false,
        includeNodeModules: false,
      },
      help: `
        --validate            Run validation only (exit with error code if violations found)
        --output-type         Output format: html, dot, archi, err, json, text (default: html)
        --output-to           Output file path (default: reports/dependency-analysis/...)
        --focus               Regex pattern to focus analysis on specific modules
        --preset              Use a predefined path set: platform, x-pack, observability, security, search, all
        --paths               Custom paths to analyze (can specify multiple)
        --config              Path to custom dependency-cruiser config
        --max-depth           Maximum depth to traverse
        --collapse-pattern    Regex pattern to collapse modules in visualization
        --include-node-modules Include node_modules in analysis (slower)
        --help                Show this help message

      Examples:
        # Validate all plugin dependencies
        node scripts/dependency_graph.js --validate

        # Generate HTML report for platform plugins
        node scripts/dependency_graph.js --preset platform --output-type html

        # Focus on dashboard plugin and its dependencies
        node scripts/dependency_graph.js --focus "^src/platform/plugins/shared/dashboard"

        # Generate high-level architecture diagram
        node scripts/dependency_graph.js --output-type archi --collapse-pattern "^src/platform/plugins/(shared|private)/[^/]+"
      `,
    },
  }
);

function getExtensionForOutputType(outputType) {
  const extensions = {
    html: 'html',
    dot: 'dot',
    archi: 'svg',
    ddot: 'dot',
    err: 'txt',
    'err-html': 'html',
    json: 'json',
    text: 'txt',
    markdown: 'md',
    mermaid: 'mmd',
    'csv-flat': 'csv',
  };
  return extensions[outputType] || 'txt';
}

function printHelp() {
  console.log(`
Kibana Dependency Graph Analysis

This tool analyzes and visualizes dependencies between Kibana plugins,
helping enforce architectural boundaries and identify coupling issues.

USAGE:
  node scripts/dependency_graph.js [options]

OPTIONS:
  --validate              Run validation mode (fails on rule violations)
  --output-type TYPE      Output format (html, dot, archi, json, err, text)
  --output-to PATH        Output file path
  --focus REGEX           Focus on modules matching the pattern
  --preset NAME           Use predefined paths (platform, x-pack, observability, security, search, all)
  --paths PATH            Paths to analyze (can be repeated)
  --config PATH           Custom config file path
  --max-depth N           Maximum traversal depth
  --collapse-pattern RE   Collapse modules matching pattern
  --help                  Show this help

EXAMPLES:
  # Validate all dependencies
  node scripts/dependency_graph.js --validate

  # Generate HTML report for security plugins
  node scripts/dependency_graph.js --preset security --output-type html

  # Analyze specific plugin
  node scripts/dependency_graph.js --paths src/platform/plugins/shared/discover --output-type html

PRESETS:
  platform     - src/platform/plugins/shared and private
  x-pack       - x-pack/platform/plugins
  observability - x-pack/solutions/observability/plugins
  security     - x-pack/solutions/security/plugins
  search       - x-pack/solutions/search/plugins
  all          - All plugin directories

OUTPUT TYPES:
  html   - Interactive HTML report (recommended for exploration)
  dot    - GraphViz DOT format (for custom rendering)
  archi  - High-level architecture SVG
  json   - JSON format (for programmatic analysis)
  err    - Text format showing only errors
  text   - Plain text list of dependencies
`);
}
