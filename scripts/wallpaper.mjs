#!/usr/bin/env node
/**
 * Hidash OS wallpaper generator — Direction D "Monsoon Blue".
 *
 * Two layers, both deterministic:
 *  1. Light field (SVG → sharp/librsvg): the night/daylight sky and the blurred pools of light,
 *     authored as analytic radial gradients with Gaussian falloff. (Big feGaussianBlur filters in
 *     librsvg are box-blur approximations that leave blotchy ghosts and darken the canvas edges, so
 *     the blur is baked into the gradient stops instead.)
 *  2. Silk (float pixel shader in JS): the folds are a height field — an asymmetric ridge along a
 *     spline (gentle lit rise, tight crest, steep drop into a contact shadow) plus a softer,
 *     out-of-focus fold behind it. Normals → Lambert + two Blinn-Phong lobes (tight specular rim,
 *     broad sheen), shaded in linear light over the light field.
 *  3. Film grain, which doubles as dither (the prebuilt sharp AVIF encoder is 8-bit only).
 *
 * Outputs (public/wallpaper/):
 *   {dark,light}-{desktop,phone}.avif|webp   full-size wallpaper
 *   {dark,light}-{desktop,phone}-blur.avif|webp  pre-blurred, slightly desaturated companion (faux glass)
 * and features/wallpaper/placeholders.ts (tiny inline WebP data URIs + average colours).
 *
 * Usage: node scripts/wallpaper.mjs [--preview <dir>]   (--preview also writes PNGs for review)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public/wallpaper");
const PLACEHOLDER_FILE = path.join(ROOT, "features/wallpaper/placeholders.ts");

/** Design space per shell (CSS px) and the raster size it is rendered at. */
const SHELLS = {
    desktop: { w: 1280, h: 800, px: [2560, 1600], blurWidth: 640, blurSigma: 18 },
    phone: { w: 430, h: 932, px: [1290, 2796], blurWidth: 430, blurSigma: 40 },
};

/** Encoder settings, tuned so phone AVIF ≤ ~120 KB and desktop ≤ ~250 KB. */
const ENCODE = {
    desktop: { avif: { quality: 82, effort: 9, chromaSubsampling: "4:2:0" }, webp: { quality: 86, effort: 6 } },
    phone: { avif: { quality: 80, effort: 9, chromaSubsampling: "4:2:0" }, webp: { quality: 84, effort: 6 } },
    blur: { avif: { quality: 70, effort: 9, chromaSubsampling: "4:2:0" }, webp: { quality: 80, effort: 6 } },
};

const THEMES = {
    dark: {
        sky: ["#00030C", "#030E33", "#06205E", "#020920"],
        // [cx, cy, radiusX, radiusY (fractions of the long side), colour, peak opacity]
        lights: [
            [0.72, 0.42, 0.6, 0.4, "#1463F3", 0.85],
            [0.66, 0.56, 0.3, 0.14, "#4C8DFF", 0.6],
            [0.12, 0.95, 0.55, 0.3, "#0B4FD6", 0.7],
            [0.02, 0.04, 0.5, 0.4, "#00020A", 0.92],
            [1.0, 1.0, 0.4, 0.3, "#00020A", 0.75],
        ],
        vignette: ["#00020A", 0.55],
        shadowTint: [0.06, 0.1, 0.32], // multiplier on the albedo at full shadow (blue-shifted, never grey)
        lift: 2.4, // how far lit slopes brighten
        spec: ["#E3EEFF", 1.3], // tight rim
        sheen: ["#3D84FF", 0.5, 8], // broad lobe: colour, weight, exponent
        grain: 2.4,
    },
    light: {
        sky: ["#FBFDFF", "#EAF2FF", "#DCE9FF", "#C9DCFF"],
        lights: [
            [0.78, 0.3, 0.55, 0.42, "#9CC2FF", 0.75],
            [0.18, 0.92, 0.6, 0.34, "#4C8DFF", 0.6],
            [0.58, 0.58, 0.3, 0.16, "#FFFFFF", 0.65],
            [0.95, 0.08, 0.3, 0.22, "#FFFFFF", 0.6],
            [0.02, 0.04, 0.45, 0.35, "#FFFFFF", 0.7],
        ],
        vignette: ["#3F7BE8", 0.16],
        shadowTint: [0.3, 0.48, 0.92],
        lift: 0.35,
        spec: ["#FFFFFF", 0.9],
        sheen: ["#FFFFFF", 0.35, 22],
        grain: 1.8,
    },
};

/**
 * Silk geometry per shell, in design units. Each fold is an asymmetric ridge along a Catmull-Rom
 * spline through `points`: it rises over `up` units above the crest (the lit side, light comes from
 * the upper right), drops over `down` units below it, and `crest` adds a tight secondary ridge that
 * produces the specular rim. `along` modulates the amplitude across the width so folds taper.
 */
const GEOMETRY = {
    desktop: [
        // back fold: wide and soft, reads as out of focus
        { points: [[-200, 330], [120, 250], [460, 340], [780, 250], [1060, 170], [1480, 120]], amp: 40, up: 220, down: 120, crest: 0, ao: 0.2, along: [[0, 0.65], [0.5, 1], [1, 0.85]] },
        // main fold
        { points: [[-200, 660], [150, 520], [470, 650], [820, 530], [1060, 430], [1480, 360]], amp: 82, up: 200, down: 16, crest: 9, ao: 0.85, along: [[0, 0.5], [0.35, 0.7], [0.7, 1], [1, 0.9]] },
        // gentle swell in the front sheet
        { points: [[-200, 820], [260, 740], [640, 800], [1000, 700], [1480, 660]], amp: 22, up: 120, down: 90, crest: 0, ao: 0, along: [[0, 0.8], [1, 0.8]] },
    ],
    phone: [
        { points: [[-80, 380], [60, 320], [190, 370], [320, 280], [520, 210]], amp: 20, up: 140, down: 120, crest: 0, ao: 0.12, along: [[0, 0.7], [0.5, 1], [1, 0.85]] },
        { points: [[-80, 720], [60, 630], [190, 680], [320, 560], [520, 470]], amp: 34, up: 110, down: 9, crest: 5, ao: 0.85, along: [[0, 0.5], [0.4, 0.9], [0.7, 1], [1, 0.7]] },
        { points: [[-80, 900], [120, 840], [300, 880], [520, 790]], amp: 12, up: 70, down: 55, crest: 0, ao: 0, along: [[0, 0.8], [1, 0.8]] },
    ],
};

/** Light direction (image y points down, so -y is "up"), view along +z. */
const L = normalize([-0.38, -0.6, 0.7]);
const H = normalize([L[0], L[1], L[2] + 1]);

function normalize(v) {
    const n = Math.hypot(...v);
    return v.map((c) => c / n);
}

const gaussStops = (colour, opacity) =>
    Array.from({ length: 9 }, (_, i) => {
        const o = i / 8;
        return `<stop offset="${o.toFixed(3)}" stop-color="${colour}" stop-opacity="${(opacity * Math.exp(-4.6 * o * o)).toFixed(4)}"/>`;
    }).join("");

/** The light field as SVG (sky + pools of light + vignette). Exported for inspection. */
export function buildSvg(themeName, shellName) {
    const t = THEMES[themeName];
    const { w, h, px } = SHELLS[shellName];
    const long = Math.max(w, h);
    const defs = [];
    const shapes = [];
    t.lights.forEach(([cx, cy, rx, ry, colour, opacity], i) => {
        // Portrait: mirror the composition's vertical placement less aggressively so light stays near the fold.
        const x = cx * w;
        const y = cy * h;
        const sx = rx * long;
        const sy = ry * long;
        defs.push(`<radialGradient id="l${i}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${x} ${y}) scale(${sx} ${sy})">${gaussStops(colour, opacity)}</radialGradient>`);
        shapes.push(`<rect width="${w}" height="${h}" fill="url(#l${i})"/>`);
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${px[0]}" height="${px[1]}" viewBox="0 0 ${w} ${h}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="${t.sky[0]}"/><stop offset="0.36" stop-color="${t.sky[1]}"/>
    <stop offset="0.72" stop-color="${t.sky[2]}"/><stop offset="1" stop-color="${t.sky[3]}"/>
  </linearGradient>
  <radialGradient id="vignette" cx="0.55" cy="0.5" r="0.78">
    <stop offset="0.5" stop-color="${t.vignette[0]}" stop-opacity="0"/>
    <stop offset="0.8" stop-color="${t.vignette[0]}" stop-opacity="${(t.vignette[1] * 0.45).toFixed(3)}"/>
    <stop offset="1" stop-color="${t.vignette[0]}" stop-opacity="${t.vignette[1]}"/>
  </radialGradient>
  ${defs.join("\n  ")}
</defs>
<rect width="${w}" height="${h}" fill="url(#sky)"/>
${shapes.join("\n")}
<rect width="${w}" height="${h}" fill="url(#vignette)"/>
</svg>`;
}

/**
 * Natural cubic spline y(x) through `points` (x strictly increasing), evaluated at each column with
 * its analytic slope. C2 continuity matters: a curvature jump at a knot (Catmull-Rom is only C1)
 * shows up as a Mach band in the specular once the surface is lit.
 */
function sampleSpline(points, xs) {
    const n = points.length;
    const X = points.map((p) => p[0]);
    const Y = points.map((p) => p[1]);
    const h = X.slice(1).map((x, i) => x - X[i]);
    // Solve for second derivatives M (natural: M0 = Mn-1 = 0) with the Thomas algorithm.
    const a = new Float64Array(n), b = new Float64Array(n), c = new Float64Array(n), d = new Float64Array(n);
    b[0] = b[n - 1] = 1;
    for (let i = 1; i < n - 1; i++) {
        a[i] = h[i - 1];
        b[i] = 2 * (h[i - 1] + h[i]);
        c[i] = h[i];
        d[i] = 6 * ((Y[i + 1] - Y[i]) / h[i] - (Y[i] - Y[i - 1]) / h[i - 1]);
    }
    for (let i = 1; i < n; i++) {
        const m = a[i] / b[i - 1];
        b[i] -= m * c[i - 1];
        d[i] -= m * d[i - 1];
    }
    const M = new Float64Array(n);
    M[n - 1] = d[n - 1] / b[n - 1];
    for (let i = n - 2; i >= 0; i--) M[i] = (d[i] - c[i] * M[i + 1]) / b[i];

    const ys = new Float64Array(xs.length);
    const slopes = new Float64Array(xs.length);
    xs.forEach((x, k) => {
        let i = 0;
        while (i < n - 2 && x > X[i + 1]) i++;
        const hi = h[i];
        const A = (X[i + 1] - x) / hi;
        const B = (x - X[i]) / hi;
        ys[k] = A * Y[i] + B * Y[i + 1] + ((A ** 3 - A) * M[i] + (B ** 3 - B) * M[i + 1]) * (hi * hi) / 6;
        slopes[k] = (Y[i + 1] - Y[i]) / hi - ((3 * A * A - 1) * M[i] - (3 * B * B - 1) * M[i + 1]) * hi / 6;
    });
    return { ys, slopes };
}

/** Smoothstep interpolation of [fraction, value] pairs. */
function interpAlong(along, f) {
    for (let i = 0; i < along.length - 1; i++) {
        const [a, va] = along[i];
        const [b, vb] = along[i + 1];
        if (f <= b) {
            const k = Math.min(1, Math.max(0, (f - a) / (b - a)));
            return va + (vb - va) * k * k * (3 - 2 * k);
        }
    }
    return along[along.length - 1][1];
}

function boxSmooth(arr, radius) {
    const out = new Float64Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        let sum = 0, n = 0;
        for (let k = Math.max(0, i - radius); k <= Math.min(arr.length - 1, i + radius); k++) {
            sum += arr[k];
            n++;
        }
        out[i] = sum / n;
    }
    return out;
}

/** Height field + ambient occlusion over the pixel grid, in design units. */
function silkField(shellName, width, height) {
    const { w } = SHELLS[shellName];
    const scale = width / w;
    const xs = Array.from({ length: width }, (_, i) => (i + 0.5) / scale);
    const folds = GEOMETRY[shellName].map((fold) => {
        const { ys, slopes } = sampleSpline(fold.points, xs);
        // Perpendicular-distance correction from a heavily smoothed slope: Catmull-Rom is only C1, and
        // an unsmoothed correction steps at every knot, which reads as a seam once lit.
        const smooth = boxSmooth(boxSmooth(slopes, Math.round(90 * scale)), Math.round(90 * scale));
        const cos = smooth.map((s) => 1 / Math.sqrt(1 + s * s));
        const amp = xs.map((x) => fold.amp * interpAlong(fold.along, x / w));
        return { ...fold, ys, cos, ampX: Float64Array.from(amp) };
    });

    const hField = new Float32Array(width * height);
    const ao = new Float32Array(width * height).fill(1);
    for (let py = 0; py < height; py++) {
        const y = (py + 0.5) / scale;
        for (let px = 0; px < width; px++) {
            let hv = 0;
            let occ = 1;
            for (const f of folds) {
                const d = (y - f.ys[px]) * f.cos[px]; // signed distance; > 0 is below the crest
                const A = f.ampX[px];
                if (d <= 0) {
                    const q = d / f.up;
                    hv += A * Math.exp(-q * q);
                    if (f.crest) {
                        const c = d / f.crest;
                        hv += A * 0.12 * Math.exp(-c * c);
                    }
                } else {
                    const q = d / f.down;
                    hv += A * Math.exp(-q * q);
                    if (f.crest) {
                        const c = d / (f.crest * 0.6);
                        hv += A * 0.12 * Math.exp(-c * c);
                    }
                    if (f.ao) {
                        // contact shadow cast by the fold onto the sheet below it
                        const s = (d - f.down * 1.2) / (f.down * 3.2 + 10);
                        occ *= 1 - f.ao * Math.exp(-s * s) * (A / f.amp);
                    }
                }
            }
            hField[py * width + px] = hv;
            ao[py * width + px] = occ;
        }
    }
    return { hField, ao, scale };
}

const toLin = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
/** Linear-light highlight shoulder: identity up to 0.8, then rolls off smoothly toward 1. */
const shoulder = (v) => (v <= 0.8 ? v : 0.8 + 0.2 * (1 - Math.exp(-(v - 0.8) / 0.2)));
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255;
const hexLin = (hex) => [1, 3, 5].map((i) => toLin(parseInt(hex.slice(i, i + 2), 16)));

/** Deterministic PRNG so regenerated assets are byte-stable. */
function mulberry32(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Shades the silk over the light field. Returns { clean, grained } 8-bit RGB buffers. */
function shade(base, width, height, themeName, shellName) {
    const t = THEMES[themeName];
    const { hField, ao, scale } = silkField(shellName, width, height);
    const lut = new Float32Array(256).map((_, i) => toLin(i));
    const spec = hexLin(t.spec[0]).map((c) => c * t.spec[1]);
    const sheen = hexLin(t.sheen[0]).map((c) => c * t.sheen[1] * (shellName === "phone" ? 0.6 : 1));
    const flatDiff = L[2];
    const flatSheen = Math.pow(H[2], t.sheen[2]);
    const rand = mulberry32(themeName === "dark" ? 1337 : 4242);
    const clean = Buffer.alloc(width * height * 3);
    const grained = Buffer.alloc(width * height * 3);
    const inv2 = scale / 2;

    for (let py = 0; py < height; py++) {
        const up = Math.max(0, py - 1) * width;
        const dn = Math.min(height - 1, py + 1) * width;
        for (let px = 0; px < width; px++) {
            const i = py * width + px;
            const hx = (hField[py * width + Math.min(width - 1, px + 1)] - hField[py * width + Math.max(0, px - 1)]) * inv2;
            const hy = (hField[dn + px] - hField[up + px]) * inv2;
            const nl = 1 / Math.sqrt(hx * hx + hy * hy + 1);
            const nx = -hx * nl, ny = -hy * nl, nz = nl;
            const ndl = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
            const ndh = Math.max(0, nx * H[0] + ny * H[1] + nz * H[2]);
            const diff = ndl / flatDiff; // 1 on flat ground
            const occ = ao[i];

            let mr, mg, mb;
            if (diff < 1) {
                const k = diff * occ;
                mr = t.shadowTint[0] + (1 - t.shadowTint[0]) * k;
                mg = t.shadowTint[1] + (1 - t.shadowTint[1]) * k;
                mb = t.shadowTint[2] + (1 - t.shadowTint[2]) * k;
            } else {
                const lift = 1 + (diff - 1) * t.lift;
                const k = occ;
                mr = (t.shadowTint[0] + (1 - t.shadowTint[0]) * k) * lift;
                mg = (t.shadowTint[1] + (1 - t.shadowTint[1]) * k) * lift;
                mb = (t.shadowTint[2] + (1 - t.shadowTint[2]) * k) * lift;
            }
            const s1 = Math.pow(ndh, 140) * occ;
            const s2 = Math.max(0, Math.pow(ndh, t.sheen[2]) - flatSheen) * occ;

            const o = i * 3;
            const r = lut[base[o]] * mr + spec[0] * s1 + sheen[0] * s2;
            const g = lut[base[o + 1]] * mg + spec[1] * s1 + sheen[1] * s2;
            const b = lut[base[o + 2]] * mb + spec[2] * s1 + sheen[2] * s2;
            // soft shoulder so highlights roll off instead of clipping
            const R = toSrgb(shoulder(r));
            const G = toSrgb(shoulder(g));
            const B = toSrgb(shoulder(b));
            clean[o] = clamp(R);
            clean[o + 1] = clamp(G);
            clean[o + 2] = clamp(B);

            // Film grain: ~Gaussian luminance noise, strongest in the mid-tones, faint chroma.
            const lum = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
            const amp = t.grain * (0.7 + 1.2 * lum * (1 - lum));
            const n = (rand() + rand() + rand() - 1.5) * 2 * amp;
            const c = (rand() - 0.5) * amp * 0.5;
            grained[o] = clamp(R + n + c);
            grained[o + 1] = clamp(G + n);
            grained[o + 2] = clamp(B + n - c);
        }
    }
    return { clean, grained };
}
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

async function renderVariant(themeName, shellName, previewDir) {
    const { px, blurWidth, blurSigma } = SHELLS[shellName];
    const svg = Buffer.from(buildSvg(themeName, shellName));
    const field = await sharp(svg, { limitInputPixels: false }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = field.info;
    if (width !== px[0] || height !== px[1]) throw new Error(`${themeName}-${shellName}: rendered ${width}x${height}, expected ${px.join("x")}`);

    const { clean, grained } = shade(field.data, width, height, themeName, shellName);
    const raw = { raw: { width, height, channels: 3 } };
    const full = () => sharp(grained, raw);
    const cleanImg = () => sharp(clean, raw);
    const name = `${themeName}-${shellName}`;
    const files = {};

    files[`${name}.avif`] = await full().avif(ENCODE[shellName].avif).toBuffer();
    files[`${name}.webp`] = await full().webp(ENCODE[shellName].webp).toBuffer();

    // Pre-blurred companion for the faux-glass fallback, from the clean render (grain only blurs to mush).
    const small = await cleanImg().resize({ width: blurWidth }).blur(blurSigma).modulate({ saturation: 0.88 }).png().toBuffer();
    files[`${name}-blur.avif`] = await sharp(small).avif(ENCODE.blur.avif).toBuffer();
    files[`${name}-blur.webp`] = await sharp(small).webp(ENCODE.blur.webp).toBuffer();

    // ~32px inline placeholder + the average colour (painted before anything else decodes).
    const tiny = await cleanImg().resize({ width: 32 }).blur(0.6).webp({ quality: 60, effort: 6 }).toBuffer();
    const stats = await cleanImg().stats();
    const hex = "#" + stats.channels.slice(0, 3).map((c) => Math.round(c.mean).toString(16).padStart(2, "0")).join("");

    if (previewDir) {
        await full().png().toFile(path.join(previewDir, `${name}.png`));
        await sharp(files[`${name}.avif`]).png().toFile(path.join(previewDir, `${name}.from-avif.png`));
        await sharp(files[`${name}-blur.avif`]).png().toFile(path.join(previewDir, `${name}-blur.png`));
        const view = shellName === "desktop" ? { width: 1280 } : { width: 430 };
        await full().resize(view).png().toFile(path.join(previewDir, `v-${name}.png`));
        await writeFile(path.join(previewDir, `${name}.svg`), svg);
    }

    return { name, files, placeholder: `data:image/webp;base64,${tiny.toString("base64")}`, color: hex };
}

async function main() {
    const previewIdx = process.argv.indexOf("--preview");
    const previewDir = previewIdx > -1 ? path.resolve(process.argv[previewIdx + 1]) : null;
    const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
    await mkdir(OUT_DIR, { recursive: true });
    if (previewDir) await mkdir(previewDir, { recursive: true });

    const placeholders = {};
    for (const theme of ["dark", "light"]) {
        for (const shell of ["desktop", "phone"]) {
            if (only && `${theme}-${shell}` !== only) continue;
            const result = await renderVariant(theme, shell, previewDir);
            for (const [file, buf] of Object.entries(result.files)) {
                await writeFile(path.join(OUT_DIR, file), buf);
                console.log(`${file.padEnd(28)} ${(buf.length / 1024).toFixed(1).padStart(7)} KB`);
            }
            placeholders[result.name] = { src: result.placeholder, color: result.color };
        }
    }
    if (only) return; // partial runs are for previewing; keep placeholders.ts complete

    const ts = `/* GENERATED by scripts/wallpaper.mjs — do not edit. Run \`npm run wallpaper\`. */
export type WallpaperVariant = "dark-desktop" | "dark-phone" | "light-desktop" | "light-phone";

/** Tiny (~32px) WebP data URIs and average colours, painted until the full wallpaper decodes. */
export const PLACEHOLDERS: Record<WallpaperVariant, { src: string; color: string }> = ${JSON.stringify(placeholders, null, 4)};
`;
    await writeFile(PLACEHOLDER_FILE, ts);
    console.log(`wrote ${path.relative(ROOT, PLACEHOLDER_FILE)}`);
}

export { SHELLS, THEMES, GEOMETRY, silkField };

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
