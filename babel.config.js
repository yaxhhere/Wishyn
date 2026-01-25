module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // 🔹 REQUIRED for absolute imports
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            screens: './screens',
            components: './components',
            utils: './utils',
            types: './types',
          },
        },
      ],

      // 🔹 MUST stay LAST
      'react-native-worklets/plugin',
    ],
  };
};
