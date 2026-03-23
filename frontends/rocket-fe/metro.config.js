const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const sdkUiSrc = path.resolve(projectRoot, '../sdk-ui/src');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    const mappedModule = path.join(sdkUiSrc, moduleName.slice(2));
    return context.resolveRequest(context, mappedModule, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
