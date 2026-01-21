/* eslint-env node */

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Find the project and workspace root
const projectRoot = __dirname;
// Since the packages are in frontends/rocket-fe, frontends/sdk-ts, frontends/sdk-ui
// The workspace root for these packages is the 'frontends' directory
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the project root and the SDKs
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, 'sdk-ts'),
  path.resolve(workspaceRoot, 'sdk-ui'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
// This prevents Metro from resolving dependencies from the wrong node_modules
config.resolver.disableHierarchicalLookup = true;

// 4. Handle pnpm symlinks
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: './global.css' });
