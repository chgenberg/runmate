// Disable source map warnings for dependencies
process.env.GENERATE_SOURCEMAP = 'false';

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix
      },
    })
  );
}; 