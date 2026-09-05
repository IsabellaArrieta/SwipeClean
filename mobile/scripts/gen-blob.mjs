// Genera una textura de "glow" (gradiente radial blanco -> transparente) y la
// deja embebida como data URI en src/components/blobAsset.ts. Se tiñe luego
// con tintColor en runtime (expo-image), así una sola textura sirve para
// cualquier color de mancha. Correr: node scripts/gen-blob.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SIZE = 256;
const svg = `
  <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
        <stop offset="25%" stop-color="#ffffff" stop-opacity="0.52"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.26"/>
        <stop offset="75%" stop-color="#ffffff" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
  </svg>`;

const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
const base64 = buffer.toString('base64');

writeFileSync(
  resolve(root, 'src/components/blobAsset.ts'),
  `// Generado por scripts/gen-blob.mjs — no editar a mano.\nexport const BLOB_GLOW = 'data:image/png;base64,${base64}';\n`,
);

console.log(`blobAsset.ts generado (${(base64.length / 1024).toFixed(1)} KB base64)`);
