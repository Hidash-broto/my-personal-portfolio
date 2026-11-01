#!/usr/bin/env node
/**
 * Personal photo pipeline for the Photos app.
 *
 * public/Me/* (original JPG/PNG, some with spaces and uppercase extensions)
 *   → public/photos/<slug>-400.avif|webp and <slug>-1200.avif|webp (EXIF orientation applied,
 *     metadata stripped, never upscaled)
 *   → public/photos/manifest.json  [{ slug, width, height, alt: "" }]  (width/height of the 1200 variant)
 *
 * Why public/photos and not public/me: macOS (APFS) and git's core.ignorecase treat "me" and "Me" as
 * the same directory, so public/me would silently land inside the old public/Me folder (which the old
 * site still references) and be committed under that casing — then /me/... would 404 on Linux.
 *
 * Usage: node scripts/images.mjs
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SOURCE_DIR = path.join(ROOT, "public/Me");
export const OUT_DIR = path.join(ROOT, "public/photos");
const WIDTHS = [400, 1200];
const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif|tiff?)$/i;

/** "WhatsApp Image 2025-05-12 at 11.55.41 AM.jpeg" → "whatsapp-image-2025-05-12-at-11-55-41-am" */
export function slugify(fileName) {
    return path
        .parse(fileName)
        .name.normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function main() {
    await mkdir(OUT_DIR, { recursive: true });
    const files = (await readdir(SOURCE_DIR)).filter((f) => IMAGE_EXT.test(f)).sort((a, b) => a.localeCompare(b));
    const manifest = [];
    const seen = new Set();
    let total = 0;

    for (const file of files) {
        let slug = slugify(file);
        for (let n = 2; seen.has(slug); n++) slug = `${slugify(file)}-${n}`;
        seen.add(slug);

        const input = path.join(SOURCE_DIR, file);
        let large = null;
        for (const width of WIDTHS) {
            // rotate() with no argument applies the EXIF orientation; output carries no metadata.
            const base = () => sharp(input, { failOn: "none" }).rotate().resize({ width, withoutEnlargement: true });
            const avif = await base().avif({ quality: 55, effort: 6, chromaSubsampling: "4:2:0" }).toBuffer({ resolveWithObject: true });
            const webp = await base().webp({ quality: 78, effort: 6 }).toBuffer();
            await writeFile(path.join(OUT_DIR, `${slug}-${width}.avif`), avif.data);
            await writeFile(path.join(OUT_DIR, `${slug}-${width}.webp`), webp);
            total += avif.data.length + webp.length;
            if (width === 1200) large = avif.info;
            console.log(`${`${slug}-${width}`.padEnd(52)} avif ${(avif.data.length / 1024).toFixed(0).padStart(4)} KB  webp ${(webp.length / 1024).toFixed(0).padStart(4)} KB`);
        }
        manifest.push({ slug, width: large.width, height: large.height, alt: "" });
    }

    await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    console.log(`${manifest.length} photos → ${path.relative(ROOT, OUT_DIR)} (${(total / 1024 / 1024).toFixed(1)} MB total)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
