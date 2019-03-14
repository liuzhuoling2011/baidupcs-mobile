module.exports = {
  lintOnSave: false,
  outputDir: 'dist_mobile',
  publicPath: '/dist_mobile/',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5299',
        changeOrigin: true
      }
    }
  }
}
