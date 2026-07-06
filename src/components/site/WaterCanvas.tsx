// The living water canvas — one continuous WebGL fluid field mounted once at
// the root, behind every section of the site. It never restarts or resets:
// scrolling translates the same world (underwater-camera feel), the cursor
// bends the nearby flow, presses emit expanding ripples, and every visual
// element (caustics, light rays, bubbles) moves through one shared flow field.
//
// Perf notes: renders at a reduced internal resolution and upscales (water is
// low-frequency, so this is invisible), caps DPR, compiles a cheaper shader
// variant on mobile, pauses when the tab is hidden, and renders a single
// static frame when the user prefers reduced motion.
import { useEffect, useRef } from "react";

// World-space scale for page scroll (px → world units). Must match the shader.
const SCROLL_K = 0.00045;
const MAX_RIPPLES = 12;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

function fragSource(quality: number) {
  return `
precision highp float;
#define QUALITY ${quality}
#define OCTAVES ${quality === 1 ? 4 : 3}

uniform vec2  u_res;      // drawing-buffer px
uniform float u_time;     // flow-time (already scroll-velocity modulated)
uniform float u_scroll;   // smoothed page scroll, px
uniform vec2  u_mouseW;   // cursor in world space
uniform float u_theme;    // 0 = dark, 1 = light (lerped)
uniform vec4  u_ripples[${MAX_RIPPLES}]; // xy = world pos, z = age s, w = amp

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < OCTAVES; i++) {
    v += a * noise(p);
    p = rot * p * 2.03;
    a *= 0.55;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  // World space: x normalised by height (square cells), y translated by the
  // scroll so the water world moves WITH the content — one continuous canvas
  // from the first pixel of the page to the last.
  vec2 w = vec2(frag.x / u_res.y, uv.y - u_scroll * ${SCROLL_K});
  float t = u_time;

  vec2 p = w * 3.0;

  // Cursor softly bends the nearby flow (domain warp, not a pasted blob).
  vec2 toM = w - u_mouseW;
  float md = length(toM);
  p += normalize(toM + 1e-4) * 0.35 * exp(-md * md * 60.0);

  // Shared flow field: everything below samples q, so all motion belongs to
  // one physical world.
  vec2 q = vec2(fbm(p + t * 0.55), fbm(p + vec2(5.2, 1.3) - t * 0.4));
  float h = fbm(p + 1.8 * q + vec2(t * 0.3, -t * 0.2));

  // Ripples: expanding rings that live in world space (they stay with the
  // content while you scroll) and decay like real surface tension.
  float rippleH = 0.0;
  float rippleGlow = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = u_ripples[i];
    float a = r.w * exp(-r.z * 1.6);
    if (a < 0.004) continue;
    float d = length(w - r.xy);
    float env = a * exp(-d * 6.0);
    float ring = sin(d * 58.0 - r.z * 9.5);
    rippleH += ring * env * 0.20;
    rippleGlow += max(ring, 0.0) * env * 0.45;
  }
  h += rippleH;
  h += 0.16 * exp(-md * md * 90.0); // gentle swell under the cursor

  // Caustics: ridged filaments advected by the same flow field.
  float ca = pow(clamp(1.0 - abs(2.0 * fbm(p * 1.6 + 2.2 * q + t * 0.5) - 1.0), 0.0, 1.0), 5.0);
  float caustic = ca * 0.75;
#if QUALITY == 1
  float ca2 = pow(clamp(1.0 - abs(2.0 * fbm(p * 3.4 - 1.5 * q - t * 0.35) - 1.0), 0.0, 1.0), 7.0);
  caustic += ca2 * 0.5;
#endif
  caustic += rippleGlow;
  caustic += 0.30 * exp(-md * md * 140.0);

  // Slow godrays drifting through the volume, stronger near the surface.
  float rayN = fbm(vec2((w.x * 0.7 - w.y * 0.35) * 2.0 - t * 0.12, t * 0.05));
  float ray = pow(smoothstep(0.45, 0.85, rayN), 2.0) * (0.35 + 0.65 * uv.y);

  // Sparse rising micro-bubbles, wiggled by the flow field.
  float bubbles = 0.0;
#if QUALITY == 1
  {
    vec2 g = vec2(w.x + q.x * 0.06, w.y - t * 0.05) * 11.0;
    vec2 id = floor(g);
    vec2 gv = fract(g) - 0.5;
    float rnd = hash(id);
    float bd = length(gv - vec2(sin(t * 0.8 + rnd * 6.28) * 0.18, 0.0));
    bubbles = smoothstep(0.05 + 0.05 * rnd, 0.0, bd) * step(0.86, rnd);
  }
#endif

  // Descending deeper down the page = subtly deeper water.
  float depth = clamp(-w.y * 0.12, 0.0, 0.55);

  // Dark theme: abyssal navy with cyan caustic light.
  vec3 colD = mix(vec3(0.012, 0.030, 0.065), vec3(0.035, 0.100, 0.170), h);
  colD += caustic * vec3(0.040, 0.200, 0.280);
  colD += ray * vec3(0.020, 0.080, 0.110);
  colD += bubbles * vec3(0.20, 0.45, 0.55);
  colD *= 1.0 - depth * 0.35;

  // Light theme: airy glacial water, pale aqua filigree — barely-there premium.
  vec3 colL = mix(vec3(0.900, 0.945, 0.975), vec3(0.975, 0.985, 0.995), h);
  colL = mix(colL, vec3(0.55, 0.78, 0.90), caustic * 0.38);
  colL += ray * vec3(0.020, 0.028, 0.034);
  colL = mix(colL, vec3(0.45, 0.72, 0.88), bubbles * 0.45);
  colL = mix(colL, vec3(0.82, 0.90, 0.95), depth * 0.5);

  vec3 col = mix(colD, colL, u_theme);

  // Soft vignette (strong in the abyss, almost none in daylight).
  float vig = smoothstep(0.5, 1.1, length(uv - 0.5) * 1.2);
  col *= 1.0 - mix(0.30, 0.07, u_theme) * vig;

  // Dither to kill banding in the deep gradients.
  col += (hash(frag * 0.7) - 0.5) * 0.008;

  gl_FragColor = vec4(col, 1.0);
}
`;
}

type Ripple = { x: number; y: number; age: number; amp: number };

export function WaterCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let raf = 0;
    let destroyed = false;
    let cleanupGL: (() => void) | null = null;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = matchMedia("(pointer: coarse)").matches || innerWidth < 768;
    const quality = isMobile ? 0 : 1;
    let resScale = isMobile ? 0.45 : 0.6; // adaptive: governor may lower it
    const DPR_CAP = isMobile ? 1 : 1.5;

    // ---- simulation state shared across context (re)inits ----
    let flowTime = Math.random() * 100;
    let last = performance.now();
    let scrollS = window.scrollY;
    let tmx = innerWidth / 2, tmy = innerHeight * 0.4;
    let mx = tmx, my = tmy;
    let themeTarget = document.documentElement.classList.contains("light") ? 1 : 0;
    let themeS = themeTarget;
    const ripples: Ripple[] = [];
    const rippleData = new Float32Array(MAX_RIPPLES * 4);

    const worldFromClient = (cx: number, cy: number) => ({
      x: cx / innerHeight,
      y: (innerHeight - cy) / innerHeight - scrollS * SCROLL_K,
    });

    const addRipple = (cx: number, cy: number, amp: number) => {
      const wpos = worldFromClient(cx, cy);
      if (ripples.length >= MAX_RIPPLES) ripples.shift();
      ripples.push({ x: wpos.x, y: wpos.y, age: 0, amp });
      if (reduced) renderOnce();
    };

    // ---- GL setup (encapsulated so context-restore can rebuild) ----
    let gl: WebGLRenderingContext | null = null;
    let uniforms: Record<string, WebGLUniformLocation | null> = {};
    let renderOnce = () => {};

    function setupGL() {
      gl = canvas!.getContext("webgl", {
        alpha: false, antialias: false, depth: false, stencil: false,
        powerPreference: "high-performance",
      });
      if (!gl) return false;
      const g = gl;

      const compile = (type: number, src: string) => {
        const s = g.createShader(type)!;
        g.shaderSource(s, src);
        g.compileShader(s);
        if (!g.getShaderParameter(s, g.COMPILE_STATUS)) {
          console.warn("[water] shader:", g.getShaderInfoLog(s));
          return null;
        }
        return s;
      };
      const vs = compile(g.VERTEX_SHADER, VERT);
      const fs = compile(g.FRAGMENT_SHADER, fragSource(quality));
      if (!vs || !fs) return false;
      const prog = g.createProgram()!;
      g.attachShader(prog, vs);
      g.attachShader(prog, fs);
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) return false;
      g.useProgram(prog);

      const buf = g.createBuffer();
      g.bindBuffer(g.ARRAY_BUFFER, buf);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
      const loc = g.getAttribLocation(prog, "a_pos");
      g.enableVertexAttribArray(loc);
      g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);

      uniforms = {};
      for (const n of ["u_res", "u_time", "u_scroll", "u_mouseW", "u_theme", "u_ripples[0]"]) {
        uniforms[n] = g.getUniformLocation(prog, n);
      }
      cleanupGL = () => {
        g.deleteProgram(prog);
        g.deleteShader(vs);
        g.deleteShader(fs);
        g.deleteBuffer(buf);
      };
      return true;
    }

    function resize() {
      if (!gl) return;
      const dpr = Math.min(devicePixelRatio || 1, DPR_CAP) * resScale;
      const wpx = Math.max(1, Math.round(innerWidth * dpr));
      const hpx = Math.max(1, Math.round(innerHeight * dpr));
      if (canvas!.width !== wpx || canvas!.height !== hpx) {
        canvas!.width = wpx;
        canvas!.height = hpx;
        gl.viewport(0, 0, wpx, hpx);
      }
    }

    function draw(dt: number) {
      const g = gl;
      if (!g) return;
      resize();

      // Scroll inertia: the camera glides, accelerates the flow when you
      // scroll fast and lets the water settle when you stop.
      const target = window.scrollY;
      const lag = target - scrollS;
      scrollS += lag * Math.min(1, dt * 5.5);
      flowTime += dt * (0.75 + Math.min(Math.abs(lag) * 0.004, 1.4));

      mx += (tmx - mx) * Math.min(1, dt * 4);
      my += (tmy - my) * Math.min(1, dt * 4);
      themeS += (themeTarget - themeS) * Math.min(1, dt * 3);

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].age += dt;
        if (ripples[i].age > 5) ripples.splice(i, 1);
      }
      rippleData.fill(0);
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        rippleData[i * 4] = r.x;
        rippleData[i * 4 + 1] = r.y;
        rippleData[i * 4 + 2] = r.age;
        rippleData[i * 4 + 3] = r.amp;
      }

      const mw = worldFromClient(mx, my);
      g.uniform2f(uniforms.u_res, canvas!.width, canvas!.height);
      g.uniform1f(uniforms.u_time, flowTime);
      g.uniform1f(uniforms.u_scroll, scrollS);
      g.uniform2f(uniforms.u_mouseW, mw.x, mw.y);
      g.uniform1f(uniforms.u_theme, themeS);
      g.uniform4fv(uniforms["u_ripples[0]"], rippleData);
      g.drawArrays(g.TRIANGLES, 0, 3);
    }

    // ---- adaptive performance governor ----
    // Some machines run WebGL on a software rasterizer (no GPU). Watch the real
    // frame time and degrade gracefully: lower internal resolution → render
    // every other frame → finally settle on a beautiful static frame. The site
    // must feel effortless everywhere, never janky.
    let ema = 1 / 60;
    let skipToggle = false;
    let frameSkip = false;
    let staticFallback = false;
    const govStart = performance.now();
    let lastGovCheck = govStart;

    function govern(now: number) {
      if (now - govStart < 800 || now - lastGovCheck < 400) return;
      lastGovCheck = now;
      // After each step, reset ema optimistically so we re-measure the new
      // configuration instead of acting again on stale history.
      if (ema > 0.08 && resScale > 0.22) {
        resScale = 0.22; ema = 0.03; // catastrophic (software rasterizer) → floor at once
      } else if (ema > 0.026 && resScale > 0.22) {
        resScale = Math.max(0.22, resScale * 0.7); ema = 0.02;
      } else if (ema > 0.033 && resScale <= 0.22 && !frameSkip) {
        frameSkip = true; ema = 0.03;
      } else if (ema > 0.055 && frameSkip) {
        // Hopeless: one calm static frame, kept aligned on scroll. Zero jank.
        staticFallback = true;
        cancelAnimationFrame(raf);
        renderOnce();
        addEventListener("scroll", onStaticScroll, { passive: true });
      }
    }

    let staticScrollQueued = false;
    const onStaticScroll = () => {
      if (staticScrollQueued) return;
      staticScrollQueued = true;
      requestAnimationFrame(() => { staticScrollQueued = false; renderOnce(); });
    };

    let lastDrawn = performance.now();
    function frame(now: number) {
      if (destroyed || staticFallback) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      skipToggle = !skipToggle;
      if (!frameSkip || skipToggle) {
        draw(dt);
        // Wall time between drawn frames (per-vsync when not skipping, 2× when
        // skipping) — this is what the governor thresholds are tuned against.
        const drawGap = Math.min((now - lastDrawn) / 1000, 0.25);
        lastDrawn = now;
        ema = ema * 0.8 + (frameSkip ? drawGap / 2 : drawGap) * 0.2;
        govern(now);
      }
      raf = requestAnimationFrame(frame);
    }

    renderOnce = () => {
      scrollS = window.scrollY;
      draw(1 / 60);
    };

    if (!setupGL()) return; // WebGL unavailable → CSS backgrounds still carry the site

    // ---- listeners ----
    const onMove = (e: PointerEvent) => { tmx = e.clientX; tmy = e.clientY; };
    const onDown = (e: PointerEvent) => addRipple(e.clientX, e.clientY, 1.0);
    let lastHover = 0;
    let lastHoverEl: Element | null = null;
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, [role='button'], .hover-lift");
      if (!el || el === lastHoverEl) return;
      const now = performance.now();
      if (now - lastHover < 140) return;
      lastHover = now;
      lastHoverEl = el;
      addRipple(e.clientX, e.clientY, 0.38);
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced && !destroyed && !staticFallback) {
        last = lastDrawn = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onResize = () => { if (reduced) renderOnce(); };
    const themeObs = new MutationObserver(() => {
      themeTarget = document.documentElement.classList.contains("light") ? 1 : 0;
      if (reduced) { themeS = themeTarget; renderOnce(); }
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); };
    const onRestored = () => {
      if (setupGL() && !destroyed) {
        if (reduced) renderOnce();
        else { last = performance.now(); raf = requestAnimationFrame(frame); }
      }
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    let removeStaticScroll: (() => void) | null = null;
    if (reduced) {
      renderOnce(); // a single, calm, already-composed frame — no motion
      const onScrollStatic = () => renderOnce(); // keep world aligned with content
      addEventListener("scroll", onScrollStatic, { passive: true });
      removeStaticScroll = () => removeEventListener("scroll", onScrollStatic);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      themeObs.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerover", onOver);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("scroll", onStaticScroll);
      removeStaticScroll?.();
      cleanupGL?.();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="water-canvas" />;
}
