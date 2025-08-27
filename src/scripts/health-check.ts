#!/usr/bin/env bun

/**
 * Health check script for Docker container
 * This script checks if the application is running properly
 */

import { createServer } from 'http';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOSTNAME || 'localhost';

function checkHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(Number(PORT), HOST, () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  try {
    const isHealthy = await checkHealth();
    if (isHealthy) {
      console.warn('Health check passed');
      process.exit(0);
    } else {
      console.error('Health check failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Health check error:', error);
    process.exit(1);
  }
}

main();
