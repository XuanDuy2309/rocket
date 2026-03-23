const path = require('path');

module.exports = function (api) {
  api.cache(true);

  const sdkUiSrc = path.resolve(__dirname, '../sdk-ui/src');

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': sdkUiSrc,
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
