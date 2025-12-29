#!/usr/bin/env node

import { ScreenCLI } from './screen-cli.js';

async function main() {
  try {
    const cli = new ScreenCLI();
    await cli.run(process.argv);
  } catch (error) {
    console.error('Fatal error:', (error as Error).message);
    process.exit(1);
  }
}

main();
