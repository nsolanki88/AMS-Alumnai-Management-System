const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AMS+ Backend API Server running on port ${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`🤖 AI Gateway Target: ${config.aiServiceUrl}`);
  console.log(`======================================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('HTTP server terminated');
    process.exit(0);
  });
});
