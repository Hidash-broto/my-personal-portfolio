#!/usr/bin/env node
/**
 * Cuts the mini-Hidash poses out of the approved character sheets and writes small
 * transparent AVIF + WebP files to public/character/.
 *
 *   node scripts/character.mjs <sheet-dir>
 *
 * <sheet-dir> holds avatar-v3.png (or avatar-v3-green.png, preferred) (turnaround: front, 3/4, side, back) and
 * avatar-poses.png (wave, type, point, celebrate), on a flat background (green screen preferred).
 * Also writes the head avatar (public/character/head.*) and the site icons
 * (app/icon.png, app/apple-icon.png, app/favicon.ico).
 *
 * Background removal: flood fill from the image border over pixels close to the sampled
 * background colour (so white sneakers and the tee, which are enclosed by the figure's
 * outline, are kept), then a soft edge and a drop of the faint floor shadow.
 */
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public/character");
/** Output height in px: 2.5x the largest on-screen figure (160 CSS px). */
const HEIGHT = 400;
/** Monsoon blue disc behind the head in app icons. */
const DISC = ["#3D86FF", "#1463F3", "#0A3DB8"];
/** Colour distance (0-441) below which a border-connected pixel is background. */
const HARD = 30;
/** Distance band above HARD that fades from transparent to opaque on the cut edge. */
const SOFT = 26;

const dist = (d, i, bg) => Math.hypot(d[i] - bg[0], d[i + 1] - bg[1], d[i + 2] - bg[2]);

/**
 * Green screen (preferred): alpha from how much greener than red/blue a pixel is, then despill
 * so edges don't carry a green fringe. Works for enclosed gaps (between the legs) too.
 */
function chromaKey(data, w, h) {
    for (let p = 0; p < w * h; p++) {
        const i = p * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const excess = g - Math.max(r, b);
        const a = excess > 90 ? 0 : excess < 25 ? 255 : Math.round(((90 - excess) / 65) * 255);
        data[i + 3] = a;
        if (excess > 0) data[i + 1] = Math.max(r, b); // despill
    }
    return { data, w, h };
}

async function cutOut(file) {
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const corner = [data[0], data[1], data[2]];
    if (corner[1] > 150 && corner[1] - Math.max(corner[0], corner[2]) > 80) return chromaKey(data, w, h);
    // Background = median of a 6px frame around the edge.
    const samples = [];
    for (let x = 0; x < w; x += 4) for (const y of [2, h - 3]) samples.push((y * w + x) * 4);
    for (let y = 0; y < h; y += 4) for (const x of [2, w - 3]) samples.push((y * w + x) * 4);
    const bg = [0, 1, 2].map((c) => samples.map((i) => data[i + c]).sort((a, b) => a - b)[samples.length >> 1]);

    const alpha = new Uint8Array(w * h).fill(255);
    const seen = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let head = 0;
    let tail = 0;
    const push = (p) => {
        if (seen[p]) return;
        seen[p] = 1;
        if (dist(data, p * 4, bg) < HARD + SOFT) queue[tail++] = p;
    };
    for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
    while (head < tail) {
        const p = queue[head++];
        const d = dist(data, p * 4, bg);
        alpha[p] = d < HARD ? 0 : Math.round(((d - HARD) / SOFT) * 255);
        if (d >= HARD) continue; // edge band: shade it, but don't flood through it
        const x = p % w;
        if (x > 0) push(p - 1);
        if (x < w - 1) push(p + 1);
        if (p >= w) push(p - w);
        if (p < w * (h - 1)) push(p + w);
    }
    for (let p = 0; p < w * h; p++) data[p * 4 + 3] = alpha[p];
    return { data, w, h };
}

/** Splits a sheet into figures by the empty columns between them. */
function figures({ data, w, h }, count) {
    const filled = new Array(w).fill(0);
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (data[(y * w + x) * 4 + 3] > 128) filled[x]++;
    const runs = [];
    let start = -1;
    for (let x = 0; x <= w; x++) {
        const on = x < w && filled[x] > 3;
        if (on && start < 0) start = x;
        if (!on && start >= 0) { runs.push([start, x]); start = -1; }
    }
    const big = runs.filter(([a, b]) => b - a > w / 40).sort((a, b) => b[1] - b[0] - (a[1] - a[0])).slice(0, count);
    if (big.length !== count) throw new Error(`expected ${count} figures, found ${big.length}`);
    return big.sort((a, b) => a[0] - b[0]);
}

async function writePose(sheet, [x0, x1], name, { bust = false } = {}) {
    const { data, w, h } = sheet;
    let top = h, bottom = 0;
    for (let y = 0; y < h; y++) for (let x = x0; x < x1; x++) if (data[(y * w + x) * 4 + 3] > 128) { top = Math.min(top, y); bottom = Math.max(bottom, y); }
    const pad = 4;
    const left = Math.max(0, x0 - pad);
    const width = Math.min(w, x1 + pad) - left;
    const y0 = Math.max(0, top - pad);
    const fullH = Math.min(h, bottom + pad) - y0;
    const height = bust ? Math.round(fullH * 0.3) : fullH;
    const base = sharp(data, { raw: { width: w, height: h, channels: 4 } })
        .extract({ left, top: y0, width, height })
        .resize({ height: bust ? 144 : HEIGHT });
    const buf = await base.png().toBuffer();
    await sharp(buf).avif({ quality: 62, effort: 6 }).toFile(path.join(OUT, `${name}.avif`));
    await sharp(buf).webp({ quality: 82, alphaQuality: 90 }).toFile(path.join(OUT, `${name}.webp`));
    const meta = await sharp(buf).metadata();
    return { name, width: meta.width, height: meta.height };
}

/** Head and shoulders, square, transparent: the avatar used for the menu bar, widgets and icons. */
async function headPng(sheet, [x0, x1], size) {
    const { data, w, h } = sheet;
    let top = h, bottom = 0;
    for (let y = 0; y < h; y++) for (let x = x0; x < x1; x++) if (data[(y * w + x) * 4 + 3] > 128) { top = Math.min(top, y); bottom = Math.max(bottom, y); }
    const figH = bottom - top;
    // Head centre: mean x of opaque pixels in the top 12% of the figure.
    let sx = 0, n = 0;
    for (let y = top; y < top + figH * 0.12; y++) for (let x = x0; x < x1; x++) if (data[(y * w + x) * 4 + 3] > 128) { sx += x; n++; }
    const cx = Math.round(sx / n);
    const side = Math.round(figH * 0.25);
    const left = Math.max(0, cx - (side >> 1));
    const y0 = Math.max(0, top - Math.round(figH * 0.018));
    return sharp(data, { raw: { width: w, height: h, channels: 4 } })
        .extract({ left, top: y0, width: Math.min(side, w - left), height: Math.min(side, h - y0) })
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
}

/** The head on a monsoon-blue disc (round) or full-bleed square (for iOS, which masks it). */
async function iconPng(sheet, range, size, { round, tight = false }) {
    let head = await headPng(sheet, range, Math.round(size * (round ? 0.9 : 0.86)));
    if (tight) {
        // Tiny favicons: the face has to fill the disc to read at 16-32px.
        const big = await headPng(sheet, range, Math.round(size * 1.45));
        const bw = (await sharp(big).metadata()).width;
        head = await sharp(big).extract({ left: Math.round((bw - size) / 2), top: Math.round(bw * 0.05), width: size, height: size - Math.round(size * 0.02) }).png().toBuffer();
    }
    const r = size / 2;
    const bg = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">` +
            `<stop offset="0" stop-color="${DISC[0]}"/><stop offset="0.55" stop-color="${DISC[1]}"/><stop offset="1" stop-color="${DISC[2]}"/></linearGradient></defs>` +
            (round ? `<circle cx="${r}" cy="${r}" r="${r}" fill="url(#g)"/>` : `<rect width="${size}" height="${size}" fill="url(#g)"/>`) +
            `</svg>`,
    );
    const offset = Math.round((size - (await sharp(head).metadata()).width) / 2);
    const headTop = tight ? Math.round(size * 0.02) : Math.round(size * (round ? 0.1 : 0.14));
    let img = sharp(bg).composite([{ input: head, left: Math.max(0, offset), top: headTop }]);
    if (round) {
        const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}"/></svg>`);
        img = sharp(await img.png().toBuffer()).composite([{ input: mask, blend: "dest-in" }]);
    }
    return img.png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 }).toBuffer();
}

/** A .ico holding PNG images (supported by every current browser). */
function ico(pngs) {
    const header = Buffer.alloc(6 + 16 * pngs.length);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);
    let offset = header.length;
    pngs.forEach(({ size, buf }, i) => {
        const e = 6 + 16 * i;
        header.writeUInt8(size >= 256 ? 0 : size, e);
        header.writeUInt8(size >= 256 ? 0 : size, e + 1);
        header.writeUInt16LE(1, e + 4);
        header.writeUInt16LE(32, e + 6);
        header.writeUInt32LE(buf.length, e + 8);
        header.writeUInt32LE(offset, e + 12);
        offset += buf.length;
    });
    return Buffer.concat([header, ...pngs.map((p) => p.buf)]);
}

const dir = process.argv[2];
if (!dir) {
    console.error("usage: node scripts/character.mjs <sheet-dir>");
    process.exit(1);
}
await fs.mkdir(OUT, { recursive: true });
const pick = async (name) => {
    const green = path.join(dir, `${name}-green.png`);
    return fs.access(green).then(() => green, () => path.join(dir, `${name}.png`));
};
const turn = await cutOut(await pick("avatar-v3"));
const poses = await cutOut(await pick("avatar-poses"));
const [front] = figures(turn, 4);
const [wave, type, point, celebrate] = figures(poses, 4);
const out = [
    await writePose(turn, front, "idle"),
    await writePose(poses, wave, "wave"),
    await writePose(poses, type, "type"),
    await writePose(poses, point, "point"),
    await writePose(poses, celebrate, "celebrate"),
];
// Head avatar (menu bar, widgets, About, share poster) and the site icons.
const head = await headPng(turn, front, 256);
await sharp(head).avif({ quality: 60, effort: 6 }).toFile(path.join(OUT, "head.avif"));
await sharp(head).webp({ quality: 84, alphaQuality: 90 }).toFile(path.join(OUT, "head.webp"));
await fs.rm(path.join(OUT, "bust.avif"), { force: true });
await fs.rm(path.join(OUT, "bust.webp"), { force: true });
const app = path.join(process.cwd(), "app");
await fs.writeFile(path.join(app, "icon.png"), await iconPng(turn, front, 512, { round: true }));
await fs.writeFile(path.join(app, "apple-icon.png"), await iconPng(turn, front, 180, { round: false }));
const icoSizes = [16, 32, 48];
await fs.writeFile(
    path.join(app, "favicon.ico"),
    ico(await Promise.all(icoSizes.map(async (size) => ({ size, buf: await iconPng(turn, front, size * 4, { round: true, tight: true }).then((b) => sharp(b).resize(size, size).png().toBuffer()) })))),
);
out.push({ name: "head", width: 256, height: 256 });
await fs.rm(path.join(OUT, "manifest.json"), { force: true });
const sizes = Object.fromEntries(out.map((o) => [o.name, { w: o.width, h: o.height }]));
await fs.writeFile(
    path.join(process.cwd(), "features/character/pose-sizes.ts"),
    `// Generated by scripts/character.mjs. Pixel sizes of public/character/*.\nexport const POSE_SIZES = ${JSON.stringify(sizes, null, 4)} as const;\n`,
);
for (const o of out) console.log(o.name, `${o.width}x${o.height}`);
