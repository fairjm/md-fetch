#!/usr/bin/env node

import { CLI } from './cli.js';

async function main() {
  try {
    const cli = new CLI();
    await cli.run(process.argv);
  } catch (error) {
    console.error('Fatal error:', (error as Error).message);
    process.exit(1);
  }
}

main();
