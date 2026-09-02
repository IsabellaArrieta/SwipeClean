// Genera los íconos de la app a partir de SVGs. Correr: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => {
  const full = resolve(root, p);
  mkdirSync(dirname(full), { recursive: true });
  return full;
};

const INDIGO = '#6366F1';
const INDIGO_LIGHT = '#818CF8';
const GREEN = '#10B981';

// Tarjeta "swipe" + check. cx/cy = centro del lienzo, s = escala general.
function glyph(cx, cy, s) {
  return `
    <g transform="translate(${cx} ${cy}) rotate(-14) scale(${s})">
      <rect x="-150" y="-215" width="300" height="380" rx="46"
            fill="#ffffff" opacity="0.22"/>
      <g>
        <rect x="-170" y="-190" width="340" height="430" rx="52" fill="#ffffff"/>
        <clipPath id="card"><rect x="-170" y="-190" width="340" height="430" rx="52"/></clipPath>
        <g clip-path="url(#card)">
          <circle cx="60" cy="-90" r="46" fill="${INDIGO_LIGHT}"/>
          <path d="M-170 150 L-40 20 L60 100 L170 -10 L170 240 L-170 240 Z" fill="${INDIGO}"/>
        </g>
      </g>
      <circle cx="150" cy="200" r="78" fill="${GREEN}"/>
      <path d="M120 200 l22 24 l44 -52" fill="none" stroke="#ffffff"
            stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

const bg = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INDIGO}"/>
      <stop offset="1" stop-color="${INDIGO_LIGHT}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#g)"/>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  ${bg}
  ${glyph(512, 512, 1.15)}
</svg>`;

// Foreground del adaptive icon de Android: glifo en la zona segura (~62% central), fondo transparente.
const adaptive = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  ${glyph(512, 512, 0.78)}
</svg>`;

// Splash / favicon: glifo sobre transparente.
const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  ${glyph(256, 256, 0.62)}
</svg>`;

const jobs = [
  [icon, 'assets/images/icon.png', 1024],
  [adaptive, 'assets/images/android-icon-foreground.png', 1024],
  [mark, 'assets/images/splash-icon.png', 512],
  [mark, 'assets/images/favicon.png', 196],
];

for (const [svg, path, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out(path));
  console.log('✓', path);
}

// Fondo sólido para el adaptive icon.
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: INDIGO } })
  .png()
  .toFile(out('assets/images/android-icon-background.png'));
console.log('✓ assets/images/android-icon-background.png');
