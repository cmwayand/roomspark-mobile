const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..'); // monorepo root
const sharedRoot = path.resolve(workspaceRoot, 'shared');

const config = getDefaultConfig(projectRoot);

// Add shared project to watchFolders
config.watchFolders = [sharedRoot];

// Let Metro resolve shared modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Optional: if using symlinks (like yarn workspaces)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@roomspark/shared') {
    return {
      filePath: path.join(sharedRoot, 'dist', 'index.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
