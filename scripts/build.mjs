import { access, copyFile, mkdir, rm } from 'node:fs/promises';

const projectRoot = new URL('../', import.meta.url);
const outputDirectory = new URL('dist/', projectRoot);
const assets = ['index.html', 'styles.css', 'mock-data.js', 'app.js'];

// Check every source before replacing the previous build.
for (const asset of assets) {
  await access(new URL(asset, projectRoot));
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const asset of assets) {
  await copyFile(new URL(asset, projectRoot), new URL(asset, outputDirectory));
}

console.log(`Built ${assets.length} static assets into dist/`);
