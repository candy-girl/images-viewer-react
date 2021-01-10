module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
        },
        debug: true,
      },
    ],
  ],
  plugins: [
    [
      'import',
      {
        libraryName: 'antd',
        style: true,
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: {
          version: 3,
          proposals: true,
        },
      },
    ],
  ],
}
