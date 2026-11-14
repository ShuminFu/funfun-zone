#!/usr/bin/env node
/**
 * Generate OG images for all posts
 *
 * Usage: npm run generate-og                    (per-post images + the site default)
 *        npm run generate-og -- --default-only  (only public/og-default.png)
 *        add --force to overwrite existing images
 *
 * Creates 1200x630 PNG images in public/og/posts/, and public/og-default.png,
 * the card BaseLayout uses for every page without its own image.
 * Uses satori + resvg for portability (no ImageMagick needed)
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'src/content/posts');
const OUTPUT_DIR = join(ROOT, 'public/og/posts');

/**
 * Read site branding from src/config.ts
 * Extracts the site URL and derives the domain name for OG images
 */
async function getSiteBranding() {
  try {
    const configContent = await readFile(join(ROOT, 'src/config.ts'), 'utf-8');
    // Try site URL first (extract domain)
    const siteMatch = configContent.match(/site:\s*['"]https?:\/\/([^'"]+)['"]/);
    if (siteMatch) return siteMatch[1].replace(/\/$/, '');
    // Fallback to site name
    const nameMatch = configContent.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) return nameMatch[1];
  } catch {
    // ignore read errors
  }
  return 'My Digital Garden';
}

// OG image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

// Colors from the Classic theme, dark mode (src/themes/index.ts)
const COLORS = {
  bgStart: '#111c28', // primary-950
  bgEnd: '#1b2837', // primary-900
  title: '#f0f3f8', // primary-100
  subtitle: '#94a3b4', // primary-400
  accent: '#03ce91', // accentDark-400
  mark: '#273546', // primary-800
};

/**
 * Extract title from markdown frontmatter
 */
function extractTitle(content) {
  const match = content.match(/^---\n[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?---/);
  return match ? match[1].trim() : null;
}

/**
 * Split title into lines for better display
 */
function splitTitle(title, maxCharsPerLine = 30) {
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Generate OG image SVG using satori
 */
async function generateOgImage(title, font, siteBranding) {
  const lines = splitTitle(title, 28);
  const fontSize = lines.length > 2 ? 42 : 52;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${COLORS.bgStart} 0%, ${COLORS.bgEnd} 100%)`,
          padding: '60px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                flex: 1,
              },
              children: lines.map((line) => ({
                type: 'div',
                props: {
                  style: {
                    color: COLORS.title,
                    fontSize: `${fontSize}px`,
                    fontWeight: 700,
                    lineHeight: 1.3,
                  },
                  children: line,
                },
              })),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                color: COLORS.subtitle,
                fontSize: '24px',
                marginTop: '40px',
              },
              children: siteBranding,
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'Inter',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  return svg;
}

/**
 * Convert SVG to PNG using resvg
 */
function svgToPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  });
  return resvg.render().asPng();
}

/**
 * Load font for satori
 */
async function loadFont() {
  // Try to load Inter from node_modules
  const interPath = join(ROOT, 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff');

  if (existsSync(interPath)) {
    return readFile(interPath);
  }

  // Fallback: fetch from Google Fonts
  console.log('  Fetching Inter font from Google Fonts...');
  const response = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2'
  );
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Site default card: name, description, domain and the sprout mark.
 */
async function generateDefaultImage(siteBranding) {
  const config = await readFile(join(ROOT, 'src/config.ts'), 'utf-8');
  const name = config.match(/\bname:\s*['"]([^'"]+)['"]/)?.[1] ?? siteBranding;
  const description = config.match(/\bdescription:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
  const logo = await readFile(join(ROOT, 'src/components/Logo.astro'), 'utf-8');
  const logoPath = logo.match(/<path d="([^"]+)"/)?.[1];
  const serif = await readFile(
    join(ROOT, 'node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff')
  );
  const sans = await readFile(join(ROOT, 'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'));

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${COLORS.bgStart} 0%, ${COLORS.bgEnd} 100%)`,
          padding: '80px 90px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', maxWidth: '760px' },
              children: [
                { type: 'div', props: { style: { fontFamily: 'Source Serif 4', fontSize: '104px', fontWeight: 600, color: COLORS.title, lineHeight: 1.05 }, children: name } },
                { type: 'div', props: { style: { fontFamily: 'Inter', fontSize: '32px', color: COLORS.subtitle, marginTop: '28px', lineHeight: 1.4 }, children: description } },
                { type: 'div', props: { style: { fontFamily: 'Inter', fontSize: '26px', color: COLORS.accent, marginTop: '44px' }, children: siteBranding } },
              ],
            },
          },
          logoPath && {
            type: 'svg',
            props: {
              width: 218,
              height: 400,
              viewBox: '0 0 481 884',
              children: { type: 'path', props: { d: logoPath, fill: COLORS.mark } },
            },
          },
        ].filter(Boolean),
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Source Serif 4', data: serif, weight: 600, style: 'normal' },
        { name: 'Inter', data: sans, weight: 400, style: 'normal' },
      ],
    }
  );

  return svg;
}

async function main() {
  console.log('Generating OG images...\n');

  const defaultPath = join(ROOT, 'public/og-default.png');
  if (!existsSync(defaultPath) || process.argv.includes('--force')) {
    console.log('  Generating: og-default.png');
    await writeFile(defaultPath, svgToPng(await generateDefaultImage(await getSiteBranding())));
  }
  if (process.argv.includes('--default-only')) return;

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Load font and site branding
  const font = await loadFont();
  const siteBranding = await getSiteBranding();

  // Get all markdown files
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md'));

  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace('.md', '');
    const outputPath = join(OUTPUT_DIR, `${slug}.png`);

    // Read post content
    const content = await readFile(join(POSTS_DIR, file), 'utf-8');
    const title = extractTitle(content);

    if (!title) {
      console.log(`  Skipping ${file} (no title found)`);
      skipped++;
      continue;
    }

    // Check if image already exists (optional: add --force flag to regenerate)
    if (existsSync(outputPath) && !process.argv.includes('--force')) {
      console.log(`  Skipping ${slug} (already exists, use --force to regenerate)`);
      skipped++;
      continue;
    }

    // Generate OG image
    console.log(`  Generating: ${slug}`);
    const svg = await generateOgImage(title, font, siteBranding);
    const png = svgToPng(svg);
    await writeFile(outputPath, png);
    generated++;
  }

  console.log(`\nDone! Generated ${generated} images, skipped ${skipped}.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
