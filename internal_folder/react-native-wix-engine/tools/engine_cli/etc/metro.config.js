module.exports = {
  resolver: {
    sourceExts: ['ts', 'tsx', 'js', 'json'],
    platforms: ['ios', 'android'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
