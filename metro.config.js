const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

console.log('🔥 METRO CONFIG LOADED 🔥');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  screens: path.resolve(__dirname, 'screens'),
  components: path.resolve(__dirname, 'components'),
  utils: path.resolve(__dirname, 'utils'),
  types: path.resolve(__dirname, 'types'),
};

module.exports = withNativeWind(config, { input: './global.css' });
