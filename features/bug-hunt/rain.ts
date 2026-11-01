/**
 * Finale: rain beading on the glass, then a wiper sweep. A small hand-written WebGL
 * shader. It never samples the DOM: each drop is a tiny lens that refracts a procedural
 * sky highlight, drawn with premultiplied alpha over the live OS.
 */

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uAmount; // 0..1, how much rain has collected
uniform float uWipe;   // 0..1, wiper progress (0 = idle)

float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

// One drop: d is the offset from its center, r its radius (screen-height units).
// acc.xy sums the lens normal, acc.z keeps the coverage.
void addDrop(vec2 d, float r, inout vec3 acc) {
    if (r <= 0.0) return;
    float dist = length(d);
    float m = 1.0 - smoothstep(r * 0.7, r, dist);
    acc.xy += (d / r) * m;
    acc.z = max(acc.z, m);
}

// Static beads, one candidate per grid cell; more cells fill in as uAmount grows.
void beads(vec2 p, float cell, float seed, float density, inout vec3 acc) {
    vec2 id = floor(p / cell);
    vec2 f = (fract(p / cell) - 0.5) * cell;
    float h = hash21(id + seed);
    if (h > density) return;
    vec2 c = (vec2(hash21(id + seed + 1.7), hash21(id + seed + 9.2)) - 0.5) * cell * 0.5;
    float r = cell * mix(0.09, 0.21, hash21(id + seed + 4.3)) * smoothstep(0.0, 0.12, density - h);
    vec2 d = f - c;
    d.y *= 0.9;
    addDrop(d, r, acc);
}

float pathX(float y, float h, float colW) {
    return (h - 0.5) * colW * 0.35 + sin(y * 13.0 + h * 21.0) * colW * 0.11;
}

// Drops that slide down a column with a little stick-slip, leaving a clear trail and residue beads.
void sliders(vec2 p, float seed, inout vec3 acc, inout float trail) {
    float colW = 0.12;
    float cx = floor(p.x / colW);
    float h = hash21(vec2(cx, seed));
    if (h > uAmount * 0.85) return;
    float lx = (fract(p.x / colW) - 0.5) * colW;
    float speed = mix(0.07, 0.16, hash21(vec2(cx, seed + 3.1)));
    float t = fract(uTime * speed + h * 13.7);
    float y = 1.15 - 1.45 * (t + 0.03 * sin(t * 25.13 + h * 6.0));
    float r = colW * mix(0.15, 0.22, hash21(vec2(cx, seed + 5.9)));

    vec2 d = vec2(lx - pathX(y, h, colW), (p.y - y) * 0.82);
    addDrop(d, r, acc);

    float above = p.y - y;
    float tr = smoothstep(0.0, 0.012, above) * (1.0 - smoothstep(0.0, 0.5, above))
             * (1.0 - smoothstep(r * 0.12, r * 0.5, abs(lx - pathX(p.y, h, colW))));
    trail = max(trail, tr);

    float s = r * 1.9;
    float seg = floor(p.y / s);
    float cy = (seg + 0.5) * s;
    float hb = hash21(vec2(cx * 7.0 + seed, seg));
    if (cy > y + r && cy < y + 0.42 && hb > 0.45) {
        float fade = 1.0 - smoothstep(y + r, y + 0.42, cy);
        addDrop(vec2(lx - pathX(cy, h, colW), p.y - cy), r * mix(0.22, 0.42, hb) * fade, acc);
    }
}

void main() {
    float aspect = uRes.x / uRes.y;
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p = vec2(uv.x * aspect, uv.y);

    vec3 acc = vec3(0.0);
    float trail = 0.0;
    beads(p, 0.08, 1.0, uAmount * 0.55, acc);
    beads(p + 0.031, 0.036, 7.0, uAmount * 0.72, acc);
    sliders(p, 3.0, acc, trail);
    sliders(p + vec2(0.06, 0.0), 11.0, acc, trail);

    // Wiper: pivots below the bottom edge and sweeps left to right; behind it the glass is dry.
    vec2 pivot = vec2(0.5 * aspect, -0.14);
    vec2 q = p - pivot;
    float ang = atan(q.x, q.y);
    float wipeAng = mix(-1.5, 1.5, uWipe);
    float active = step(0.001, uWipe) * (1.0 - step(0.999, uWipe));
    float cleared = uWipe > 0.0 ? 1.0 - smoothstep(wipeAng - 0.05, wipeAng + 0.01, ang) : 0.0;
    float keep = 1.0 - cleared;

    vec2 n = acc.xy;
    float nl = min(length(n), 1.0);
    n = nl > 0.0 ? normalize(n) * nl : n;
    float cover = acc.z * keep;

    // Lens: the bottom of a drop shows the bright sky above it, inverted.
    float lensLight = smoothstep(-0.25, 1.0, -n.y);
    vec3 N = normalize(vec3(n, sqrt(max(0.0, 1.0 - nl * nl)) + 0.35));
    vec3 H = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(N, H), 0.0), 70.0);
    float rim = smoothstep(0.6, 1.0, nl) * (0.45 + 0.55 * clamp(dot(n, vec2(0.45, -0.75)), 0.0, 1.0));

    vec3 deep = vec3(0.015, 0.05, 0.14);
    vec3 sky = mix(vec3(0.62, 0.78, 1.0), vec3(0.92, 0.96, 1.0), uv.y);
    vec3 col = mix(deep, sky, lensLight * 0.9);
    float alpha = cover * (0.22 + 0.42 * lensLight + 0.45 * rim);
    vec3 outC = col * alpha + vec3(1.0) * spec * cover * 0.9;
    float outA = alpha + spec * cover * 0.6;

    // A faint mist that sliding drops have cleared.
    float mist = uAmount * 0.09 * (1.0 - trail) * keep;
    outC += vec3(0.72, 0.82, 0.96) * mist * (1.0 - outA);
    outA += mist * (1.0 - outA);

    // Water pushed ahead of the blade, then the blade itself.
    vec2 dir = vec2(sin(wipeAng), cos(wipeAng));
    float along = dot(q, dir);
    float perp = q.x * dir.y - q.y * dir.x;
    float reach = step(0.16, along) * (1.0 - smoothstep(1.28, 1.32, along)) * active;
    float w = (perp - 0.018) / 0.01;
    float wave = exp(-w * w) * 0.55 * reach * uAmount;
    outC += vec3(0.85, 0.92, 1.0) * wave * (1.0 - outA);
    outA += wave * (1.0 - outA);
    float blade = (1.0 - smoothstep(0.004, 0.008, abs(perp))) * reach;
    float edge = (1.0 - smoothstep(0.0, 0.003, abs(perp + 0.004))) * reach;
    vec3 bladeC = mix(vec3(0.035, 0.04, 0.055), vec3(0.32, 0.36, 0.44), edge);
    outC = bladeC * blade + outC * (1.0 - blade);
    outA = blade + outA * (1.0 - blade);

    gl_FragColor = vec4(min(outC, vec3(outA)), outA);
}
`;

export interface RainController {
    /** 0..1: how much rain has collected. */
    setAmount(amount: number): void;
    /** Sweep the wiper across; resolves when the glass is clear. */
    wipe(durationMs: number): Promise<void>;
    destroy(): void;
}

export function webglAvailable(): boolean {
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        if (!gl) return false;
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return true;
    } catch {
        return false;
    }
}

/**
 * Device tier A: deviceMemory unknown or > 4 GB, more than 4 cores, and WebGL.
 * Hardware effects follow the device tier, never the (round-forced) glass mode.
 */
export function isTierA(): boolean {
    if (typeof navigator === "undefined") return false;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    return (memory === undefined || memory > 4) && typeof cores === "number" && cores > 4 && webglAvailable();
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/** Null when WebGL or the shader is unavailable; the caller then shows the static overlay. */
export function createRain(canvas: HTMLCanvasElement, opts: { onContextLost: () => void }): RainController | null {
    let gl: WebGLRenderingContext | null = null;
    try {
        gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    } catch {
        gl = null;
    }
    if (!gl) return null;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uAmount = gl.getUniformLocation(program, "uAmount");
    const uWipe = gl.getUniformLocation(program, "uWipe");

    let amount = 0;
    let wipe = 0;
    let raf = 0;
    let alive = true;
    const t0 = performance.now();

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
        const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
    };

    const frame = (now: number) => {
        if (!alive || !gl) return;
        resize();
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - t0) / 1000);
        gl.uniform1f(uAmount, amount);
        gl.uniform1f(uWipe, wipe);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onLost = (event: Event) => {
        event.preventDefault();
        alive = false;
        cancelAnimationFrame(raf);
        opts.onContextLost();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return {
        setAmount(next) {
            amount = Math.min(1, Math.max(0, next));
        },
        wipe(durationMs) {
            return new Promise((resolve) => {
                const start = performance.now();
                const step = (now: number) => {
                    const t = Math.min(1, (now - start) / durationMs);
                    wipe = t < 1 ? 0.5 - Math.cos(Math.PI * t) / 2 : 1;
                    if (t < 1 && alive) requestAnimationFrame(step);
                    else resolve();
                };
                requestAnimationFrame(step);
            });
        },
        destroy() {
            alive = false;
            cancelAnimationFrame(raf);
            canvas.removeEventListener("webglcontextlost", onLost);
            gl?.deleteProgram(program);
            gl?.deleteShader(vs);
            gl?.deleteShader(fs);
            gl?.deleteBuffer(buffer);
        },
    };
}
