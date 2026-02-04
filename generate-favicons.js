
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, 'public', 'logo-source.png');
const outputDir = path.join(__dirname, 'public');

if (!fs.existsSync(source)) {
    console.error('Source file not found at:', source);
    process.exit(1);
}

const sizes = [
    { name: 'favicon-16x16.png', width: 16, height: 16 },
    { name: 'favicon-32x32.png', width: 32, height: 32 },
    { name: 'apple-touch-icon.png', width: 180, height: 180 },
    { name: 'android-chrome-192x192.png', width: 192, height: 192 },
    { name: 'android-chrome-512x512.png', width: 512, height: 512 }
];

async function generate() {
    console.log('Starting generation...');

    // Generate PNGs
    for (const size of sizes) {
        try {
            await sharp(source)
                .resize(size.width, size.height)
                .toFile(path.join(outputDir, size.name));
            console.log(`Generated ${size.name}`);
        } catch (e) {
            console.error(`Error generating ${size.name}:`, e);
        }
    }

    // Generate ICO
    try {
        // sharp can output ico in some versions, but if not we fallback
        // We will try to produce a png and rename it if ico not supported, or just let sharp try
        // Usually sharp .toFormat('ico') works if libvips has it, or we use a hack.
        // For safety, let's just use 32x32 png as favicon.ico as most browsers support it,
        // or better, generate a 32x32 png called favicon.ico.
        // However, real ICO is multi-size.
        // Let's try explicit ico format.
        await sharp(source).resize(32, 32).toFormat('ico').toFile(path.join(outputDir, 'favicon.ico'));
        console.log('Generated favicon.ico');
    } catch (e) {
        console.log('Could not generate proper .ico, copying 32x32 png as .ico');
        try {
            fs.copyFileSync(path.join(outputDir, 'favicon-32x32.png'), path.join(outputDir, 'favicon.ico'));
        } catch (err) {
            console.error('Failed to fallback copy:', err);
        }
    }
}

generate().catch(console.error);
