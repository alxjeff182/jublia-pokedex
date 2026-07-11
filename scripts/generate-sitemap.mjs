#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'https://alxjeff182.github.io/jublia-pokedex';
const STATIC_ROUTES = ['/', '/browse', '/favorites', '/settings', '/compare'];
const OUTPUT_DIR = 'public';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'sitemap.xml');

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildUrlEntry(loc) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`;
}

async function fetchPokemonNames() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
    if (!response.ok) {
      throw new Error(`PokeAPI responded with ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((entry) => entry.name);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`generate-sitemap: PokeAPI fetch failed (${message}); writing static routes only.`);
    return [];
  }
}

async function main() {
  const pokemonNames = await fetchPokemonNames();
  const urls = [
    ...STATIC_ROUTES.map((route) => `${BASE_URL}${route === '/' ? '/' : route}`),
    ...pokemonNames.map((name) => `${BASE_URL}/pokemon/${name}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(buildUrlEntry).join('\n')}
</urlset>
`;

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, xml, 'utf8');
  console.log(`generate-sitemap: wrote ${urls.length} URLs to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error('generate-sitemap failed:', error);
  process.exit(1);
});
