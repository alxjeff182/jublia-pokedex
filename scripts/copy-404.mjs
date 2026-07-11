#!/usr/bin/env node

import { access, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const indexPath = path.join('www', 'browser', 'index.html');
const destPath = path.join('www', 'browser', '404.html');

async function main() {
  await access(indexPath, constants.F_OK);
  await copyFile(indexPath, destPath);
  console.log(`copy-404: created ${destPath} for GitHub Pages SPA routing`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`copy-404 failed: ${message}`);
  process.exit(1);
});
