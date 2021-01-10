/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const Config = require('webpack-chain')
const autoprefixer = require('autoprefixer')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const DEFAULT_BROWSERS = [
  '>1%',
  'last 4 versions',
  'Firefox ESR',
  'not ie < 9', // React doesn't support IE8 anyway
]

const config = new Config()

config.entry('index').add('./src/index.tsx').end().output.path(path.resolve(__dirname, 'dist')).filename('index.js')

config.module
  .rule('tsx')
  .test(/\.tsx?$/)
  .use('babel-loader')
  .loader('babel-loader')
  .end()
  .use('ts-loader')
  .loader('ts-loader')
  .options({
    configFile: path.join(__dirname, 'tsconfig.json'),
    // transpileOnly: true,
  })
config.module
  .rule('worker')
  .test(/\.worker\.(.*)\.js$/)
  .use('worker-loader')
  .loader('worker-loader')
  .options({
    inline: 'no-fallback',
  })

config.module
  .rule('less')
  .test(/\.less/)
  .use('style-loader')
  .loader('style-loader')
  .end()
  // .use('MiniCssExtractPlugin.loader')
  //   .loader(MiniCssExtractPlugin.loader)
  //   .end()
  .use('css-loader')
  .loader('css-loader')
  .options({
    sourceMap: false,
  })
  .end()
  .use('postcss-loader')
  .loader('postcss-loader')
  .options({
    plugins: () => [
      autoprefixer({
        overrideBrowserslist: DEFAULT_BROWSERS,
        flexbox: 'no-2009',
      }),
    ],
  })
  .end()
  .use('less-loader')
  .loader('less-loader')
  .options({
    sourceMap: false,
    javascriptEnabled: true,
  })
config.module
  .rule('css')
  .test(/\.css$/)
  .use('style-loader')
  .loader('style-loader')
  .end()
  .use('css-loader')
  .loader('css-loader')
  .options({
    sourceMap: false,
  })
  .end()
  .use('postcss-loader')
  .loader('postcss-loader')
  .options({
    plugins: () => [
      autoprefixer({
        overrideBrowserslist: DEFAULT_BROWSERS,
        flexbox: 'no-2009',
      }),
    ],
  })

config.module
  .rule('eot')
  .test(/\.eot(\?v=\d+\.\d+\.\d+)?$/)
  .use('url-loader')
  .loader('url-loader')
  .options({
    limit: 10000,
    minetype: 'application/font-woff',
  })

config.module
  .rule('svg')
  .test(/\.svg(\?v=\d+\.\d+\.\d+)?$/)
  .use('url-loader')
  .loader('url-loader')
  .options({
    limit: 10000,
    minetype: 'image/svg+xml',
  })

config.module
  .rule('ttf')
  .test(/\.ttf(\?v=\d+\.\d+\.\d+)?$/)
  .use('url-loader')
  .loader('url-loader')
  .options({
    limit: 10000,
    minetype: 'application/octet-stream',
  })

config.module
  .rule('woff')
  .test(/\.woff(\?v=\d+\.\d+\.\d+)?$/)
  .use('url-loader')
  .loader('url-loader')
  .options({
    limit: 10000,
    minetype: 'application/font-woff',
  })

config.module
  .rule('image')
  .test(/\.(jpg|png|pdf)$/)
  .use('url-loader')
  .loader('url-loader')
  .options({
    limit: 20000,
  })

config.resolve.extensions.merge(['.tsx', '.ts', '.js']).end().modules.add(path.join(__dirname, 'node_modules'))

// config.plugin('MiniCssExtractPlugin')
//   .use(MiniCssExtractPlugin)

module.exports = config
