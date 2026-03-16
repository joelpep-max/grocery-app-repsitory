const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro sees changes in packages/shared
config.watchFolders = [workspaceRoot];

// Resolve node_modules from both mobile/ and the workspace root (hoisted deps)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Follow npm workspace symlinks (e.g. node_modules/@grocery-app/shared -> ../../packages/shared)
config.resolver.unstable_enableSymlinks = true;

// Pin React and React Native to the mobile package's copies to prevent
// "multiple React instances" errors when following symlinks into shared packages
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

module.exports = config;
