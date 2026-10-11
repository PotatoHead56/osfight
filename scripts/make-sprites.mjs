// Turns raw photos into fixed-size pixel-art sprites: background removed,
// subject centred, hard pixel edges and a dark outline.
//
//   npm run sprites                              every photo in /photos -> /public/fighters
//   node scripts/make-sprites.mjs <in> <out.png> one photo (used by the upload form)
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { removeBackground } from "@imgly/background-removal-node";

// Use the sharp copy bundled with the background remover: loading a second
// sharp version in the same process fails on Windows (clashing libvips DLLs).
const sharp = createRequire(
  import.meta.resolve("@imgly/background-removal-node"),
)("sharp");

// Keep in sync with SPRITE_SIZE in src/components/FighterCard.tsx.
const SPRITE_SIZE = 64;
// Empty pixels kept around the subject so the outline never touches the edge.
const MARGIN = 3;
const COLOURS = 24;
const OUTLINE = [5, 4, 10];
// Pixels the cutout marks as less opaque than this are dropped.
const ALPHA_CUTOFF = 128;

// Makes every pixel fully opaque or fully transparent, then draws a 1px outline
// on the transparent pixels that touch the subject.
function hardenAndOutline(pixels, size) {
  const opaque = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    opaque[i] = pixels[i * 4 + 3] >= ALPHA_CUTOFF ? 1 : 0;
  }
  const isOpaque = (x, y) =>
    x >= 0 && y >= 0 && x < size && y < size && opaque[y * size + x] === 1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (opaque[y * size + x]) {
        pixels[i + 3] = 255;
      } else if (
        isOpaque(x - 1, y) ||
        isOpaque(x + 1, y) ||
        isOpaque(x, y - 1) ||
        isOpaque(x, y + 1)
      ) {
        pixels.set([...OUTLINE, 255], i);
      } else {
        pixels.set([0, 0, 0, 0], i);
      }
    }
  }
  return pixels;
}

async function makeSprite(input, output) {
  // Bake in the EXIF orientation from phone cameras before cutting out.
  const upright = await sharp(await readFile(input)).rotate().png().toBuffer();
  const cutout = await removeBackground(
    new Blob([upright], { type: "image/png" }),
  );

  const inner = SPRITE_SIZE - MARGIN * 2;
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const { data } = await sharp(Buffer.from(await cutout.arrayBuffer()))
    .trim()
    .resize(inner, inner, { fit: "contain", background: transparent })
    .extend({
      top: MARGIN,
      bottom: MARGIN,
      left: MARGIN,
      right: MARGIN,
      background: transparent,
    })
    .modulate({ saturation: 1.25 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  await mkdir(path.dirname(output), { recursive: true });
  await sharp(hardenAndOutline(data, SPRITE_SIZE), {
    raw: { width: SPRITE_SIZE, height: SPRITE_SIZE, channels: 4 },
  })
    .png({ palette: true, colours: COLOURS, dither: 0 })
    .toFile(output);
}

const [input, output] = process.argv.slice(2);

if (input && output) {
  await makeSprite(input, output);
} else {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const sourceDir = path.join(root, "photos");
  const outputDir = path.join(root, "public", "fighters");

  const photos = (await readdir(sourceDir)).filter((file) =>
    /\.(jpe?g|png|webp)$/i.test(file),
  );
  for (const file of photos) {
    const sprite = path.join(outputDir, `${path.parse(file).name}.png`);
    await makeSprite(path.join(sourceDir, file), sprite);
    console.log(`${file} -> ${path.relative(root, sprite)}`);
  }
  console.log(
    `Done: ${photos.length} sprite(s) at ${SPRITE_SIZE}x${SPRITE_SIZE}.`,
  );
}
