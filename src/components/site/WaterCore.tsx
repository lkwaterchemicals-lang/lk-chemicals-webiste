// THE LIVING WATER CORE — the homepage's closing experience.
//
// One WebGL scene: a floating glass sphere (analytic optics — refraction with
// chromatic dispersion, fresnel reflections, Beer-Lambert absorption, a slowly
// swirling luminous core, rising micro-bubbles) suspended in a layered water
// environment (caustic filaments, volumetric shafts, drifting particles).
// The cursor gently steers the sphere and bends the water; taps/presses emit
// soft ripples. Dark and light modes are two independent art directions fed
// from the same motion system.
//
// Renders only while on screen, at a reduced internal resolution, with an
// adaptive governor (resolution → static frame) so it never janks anywhere.
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { LiquidButton } from "./LiquidButton";
import { MicroLabel } from "./GhostWord";

const MAX_RIPPLES = 6;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

function fragSource(quality: number) {
  return `
precision highp float;
#define Q ${quality}
#define OCT ${quality === 1 ? 4 : 3}
/* Low-res tiers blur soft fields into fog — pull the volumetrics back so the
   deep water stays rich navy on phones instead of murky gray. */
#define SHAFT_GAIN ${quality === 1 ? "1.0" : "0.55"}
#define CAUSTIC_GAIN ${quality === 1 ? "1.0" : "0.8"}

uniform vec2  u_res;
uniform float u_time;
uniform float u_theme;   // 0 dark · 1 light (lerped)
uniform vec2  u_mouse;   // scene units, smoothed
uniform vec2  u_anchor;  // sphere centre, scene units
uniform float u_radius;
uniform float u_reveal;  // 0→1 as the section scrolls into view
uniform vec4  u_ripples[${MAX_RIPPLES}];

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1, 0)), f.x),
    mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < OCT; i++) { v += a * noise(p); p = m * p * 2.03; a *= 0.55; }
  return v;
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

/* Deep engineered water — rich navy, graphite, controlled cyan. */
vec3 envDark(vec2 p, float t) {
  float g = clamp(p.y + 0.5, 0.0, 1.0);
  vec3 col = mix(vec3(0.012, 0.030, 0.062), vec3(0.035, 0.062, 0.098), g * 0.7);
  vec2 q = vec2(fbm(p * 2.4 + t * 0.06), fbm(p * 2.4 - vec2(t * 0.05, 0.0)));
  float ca = pow(clamp(1.0 - abs(2.0 * fbm(p * 3.0 + 2.0 * q + vec2(0.0, t * 0.08)) - 1.0), 0.0, 1.0), 6.0);
  col += ca * vec3(0.028, 0.130, 0.180) * (0.45 + 0.55 * (1.0 - g)) * CAUSTIC_GAIN;
  float shaft = pow(smoothstep(0.52, 0.95, fbm(vec2(p.x * 1.4 - p.y * 0.5, t * 0.03))), 2.0) * smoothstep(-0.55, 0.55, p.y);
  col += shaft * vec3(0.018, 0.065, 0.095) * SHAFT_GAIN;
  return col;
}
/* Crystal purified water — glacial pool daylight: defined blue depth and
   visible sun caustics, never a white haze. */
vec3 envLight(vec2 p, float t) {
  float g = clamp(p.y + 0.5, 0.0, 1.0);
  vec3 col = mix(vec3(0.760, 0.848, 0.918), vec3(0.912, 0.945, 0.972), g);
  float vein = fbm(p * 2.0 + fbm(p * 3.1 + t * 0.02) * 1.2);
  col -= (vein - 0.5) * 0.050;
  vec2 q = vec2(fbm(p * 2.6 + t * 0.05), fbm(p * 2.6 - vec2(t * 0.04, 0.0)));
  float ca = pow(clamp(1.0 - abs(2.0 * fbm(p * 3.4 + 2.1 * q) - 1.0), 0.0, 1.0), 6.0);
  col = mix(col, vec3(0.470, 0.690, 0.870), ca * 0.34);
  float shaft = pow(smoothstep(0.52, 0.95, fbm(vec2(p.x * 1.4 - p.y * 0.5, t * 0.03))), 2.0) * smoothstep(-0.55, 0.55, p.y);
  col = mix(col, vec3(0.965, 0.985, 1.0), shaft * 0.30);
  return col;
}
vec3 env(vec2 p, float t) { return mix(envDark(p, t), envLight(p, t), u_theme); }

float particles(vec2 p, float n, vec2 drift, float thr) {
  vec2 g = p * n + drift;
  vec2 id = floor(g);
  vec2 gv = fract(g) - 0.5;
  float rnd = hash(id);
  vec2 off = (vec2(hash(id + 7.3), hash(id + 3.1)) - 0.5) * 0.6;
  float d = length(gv - off);
  return smoothstep(0.05 + 0.04 * rnd, 0.0, d) * step(thr, rnd);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * u_res) / u_res.y;
  float t = u_time;

  // Ripples gently bend the water the environment is sampled through.
  vec2 rp = p;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = u_ripples[i];
    float a = r.w * exp(-r.z * 1.8);
    if (a < 0.004) continue;
    float d = length(p - r.xy);
    rp += normalize(p - r.xy + 1e-4) * sin(d * 42.0 - r.z * 7.0) * exp(-d * 5.0) * a * 0.012;
  }
  // The cursor bends nearby water too.
  float mdist = length(p - u_mouse);
  rp += normalize(p - u_mouse + 1e-4) * 0.006 * exp(-mdist * mdist * 14.0);

  vec3 col = env(rp, t);

  // Suspended particles on two depth layers, drifting with the current and
  // parallaxed by the cursor.
  float p1 = particles(p + u_mouse * 0.020, 6.0, vec2(t * 0.016, -t * 0.011), 0.88);
  col = mix(col, mix(vec3(0.38, 0.72, 0.86), vec3(0.26, 0.52, 0.75), u_theme), p1 * mix(0.35, 0.45, u_theme));
#if Q == 1
  float p2 = particles(p + u_mouse * 0.045, 11.0, vec2(-t * 0.010, -t * 0.018), 0.90);
  col = mix(col, mix(vec3(0.55, 0.85, 0.95), vec3(0.33, 0.56, 0.76), u_theme), p2 * mix(0.28, 0.36, u_theme));
#endif

  // ---- the centrepiece ----
  // Rises and settles as the section scrolls into view.
  vec2 c = u_anchor
    + vec2(0.014 * sin(t * 0.21 + 1.3), 0.020 * sin(t * 0.33))
    + vec2(0.0, (u_reveal - 1.0) * 0.10)
    + u_mouse * 0.020;
  float R = u_radius * (0.86 + 0.14 * u_reveal);
  vec2 q = p - c;
  float r = length(q);

  // Breathing ripple — a slow pressure ring exhaled by the core.
  {
    float ph = fract(t * 0.085);
    float ringR = R * (1.06 + ph * 1.35);
    float ring = exp(-abs(r - ringR) * 58.0) * (1.0 - ph) * step(R, r) * u_reveal;
    col += ring * vec3(0.020, 0.105, 0.145) * (1.0 - u_theme) * 0.9;
    col = mix(col, vec3(0.34, 0.60, 0.84), ring * u_theme * 0.38);
  }

  // Orbiting micro-droplets — three glass beads on a tilted ellipse. Beads on
  // the far side draw before the sphere (occluded by it); near-side beads draw
  // after it. Same math both passes, selected by orbit phase.
#define BEAD(i, FRONT) { \
    float phase = t * (0.14 + 0.028 * float(i)) + float(i) * 2.094; \
    float behind = step(0.0, sin(phase)); \
    if (abs(behind - (1.0 - FRONT)) < 0.5) { \
      vec2 orb = c + rot(0.32) * vec2(cos(phase) * R * 1.42, sin(phase) * R * 0.40); \
      float oR = R * (0.050 + 0.013 * float(i)) * mix(1.08, 0.86, behind); \
      float od = length(p - orb); \
      float mask = smoothstep(oR, oR * 0.45, od) * u_reveal; \
      vec3 beadCol = env(orb, t) * mix(0.72, 0.90, u_theme); \
      vec2 hq = p - orb + vec2(oR * 0.35, -oR * 0.35); \
      beadCol += exp(-dot(hq, hq) * (9.0 / (oR * oR))) * mix(vec3(0.45, 0.75, 0.88), vec3(1.0), u_theme) * 0.8; \
      float rimB = smoothstep(oR * 0.6, oR * 0.95, od) * (1.0 - smoothstep(oR * 0.95, oR, od)); \
      beadCol += rimB * mix(vec3(0.10, 0.34, 0.44), vec3(0.30, 0.55, 0.78), u_theme) * 0.5; \
      col = mix(col, beadCol, mask); \
    } \
  }
  BEAD(0, 0.0) BEAD(1, 0.0) BEAD(2, 0.0)

  // Grounding: soft elliptical shadow in daylight, cyan under-glow in the deep.
  vec2 sp = (p - (c - vec2(0.0, R * 1.16))) * vec2(1.35, 5.0);
  float sh = exp(-dot(sp, sp) * 5.0);
  col = mix(col, col * vec3(0.74, 0.80, 0.86), sh * 0.75 * u_theme);
  col += sh * vec3(0.020, 0.095, 0.135) * (1.0 - u_theme) * 0.55;

  if (r < R) {
    vec3 n = vec3(q / R, sqrt(max(0.0, 1.0 - (r * r) / (R * R))));
    float F = pow(1.0 - n.z, 3.0);

    // Refraction: the sphere lenses an inverted, minified image of the world
    // behind it, with slight chromatic dispersion toward the edge.
    float mag = -0.42 - 0.26 * F;
    vec3 glass;
    glass.r = env(c + q * mag * 0.982, t).r;
    glass.g = env(c + q * mag, t).g;
    glass.b = env(c + q * mag * 1.018, t).b;

    // Absorption tint by optical thickness (Beer-Lambert, cheap). In daylight
    // the glass reads a touch deeper than the marble behind it — real lensing,
    // not a glow.
    vec3 tint = mix(vec3(0.70, 0.90, 1.00), vec3(0.60, 0.79, 0.93), u_theme);
    glass *= mix(vec3(1.0), tint, 0.35 + 0.55 * n.z);
    glass *= mix(1.0, 0.925, u_theme);

    // The living core — a slow luminous swirl, denser toward the centre.
    vec2 s = rot(t * 0.11) * q * (3.2 / R);
    float swirl = fbm(s * 1.6 + vec2(fbm(s + vec2(0.0, t * 0.14)), fbm(s - vec2(t * 0.11, 0.0))));
    float core = pow(clamp(1.0 - abs(2.0 * swirl - 1.0), 0.0, 1.0), 4.0) * smoothstep(R * 0.92, R * 0.22, r);
    glass += core * mix(vec3(0.075, 0.330, 0.430), vec3(0.06, 0.28, 0.46), u_theme) * mix(0.5, 0.55, u_theme);

#if Q == 1
    // Rising micro-bubbles inside the chamber.
    vec2 bg2 = vec2(q.x, q.y - t * 0.018) * (14.0 / R);
    vec2 bid = floor(bg2);
    vec2 bgv = fract(bg2) - 0.5;
    float brnd = hash(bid);
    float bub = smoothstep(0.055 + 0.05 * brnd, 0.015, length(bgv)) * step(0.88, brnd) * smoothstep(R, R * 0.45, r);
    glass += bub * mix(0.22, 0.30, u_theme);
#endif

    // Fresnel reflection of the environment.
    glass = mix(glass, env(c + q * 1.9 + vec2(0.0, 0.05), t) * mix(1.15, 1.0, u_theme), F * 0.55);

    // Two studio key lights, drifting almost imperceptibly.
    vec2 h1 = rot(0.05 * sin(t * 0.09)) * vec2(-0.40, 0.44) * R;
    vec2 h2 = vec2(0.30, -0.34) * R;
    glass += exp(-dot(q - h1, q - h1) * (300.0 / (R * R))) * mix(vec3(0.45, 0.78, 0.90), vec3(0.92, 0.96, 1.0), u_theme) * mix(0.85, 0.5, u_theme);
    glass += exp(-dot(q - h2, q - h2) * (750.0 / (R * R))) * mix(0.22, 0.14, u_theme);

    // Glass rim — cyan whisper in the deep, cool silver in daylight.
    float rim = smoothstep(R * 0.90, R * 0.98, r) * (1.0 - smoothstep(R * 0.98, R, r));
    glass += rim * mix(vec3(0.10, 0.36, 0.46) * 0.5, vec3(0.24, 0.50, 0.74) * 0.5, u_theme);
    // Daylight: a darker refraction band hugs the lower edge of real glass.
    glass -= rim * vec3(0.10, 0.08, 0.05) * u_theme * smoothstep(0.0, -R * 0.6, q.y);

    col = mix(col, glass, smoothstep(R, R - 0.0045, r));
  }

  // Near-side orbiting beads pass in front of the sphere.
  BEAD(0, 1.0) BEAD(1, 1.0) BEAD(2, 1.0)

  // Cinematic edges (subtle in daylight).
  vec2 uv = frag / u_res;
  float vig = smoothstep(0.55, 1.15, length(uv - 0.5) * 1.35);
  col *= 1.0 - mix(0.26, 0.13, u_theme) * vig;

  col += (hash(frag * 0.7) - 0.5) * 0.008;

  // Dissolve the top of the chamber into the page's own living water —
  // no visible seam where the section begins (premultiplied alpha).
  float alpha = 1.0 - smoothstep(0.86, 1.0, uv.y);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;
}

type Ripple = { x: number; y: number; age: number; amp: number };

function WaterCoreCanvas() {
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
    let resScale = isMobile ? 0.58 : 0.62;
    const DPR_CAP = isMobile ? 1 : 1.5;

    let flowTime = Math.random() * 60;
    let last = performance.now();
    let tmx = 0,
      tmy = 0,
      mx = 0,
      my = 0; // scene units
    let themeTarget = document.documentElement.classList.contains("light") ? 1 : 0;
    let themeS = themeTarget;
    let revealTarget = 0;
    let revealS = 0;
    let anchor = { x: 0.4, y: 0.0 };
    let radius = 0.3;
    const ripples: Ripple[] = [];
    const rippleData = new Float32Array(MAX_RIPPLES * 4);
    let inView = false;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.width / Math.max(1, rect.height);
      if (aspect >= 1.05) {
        anchor = { x: Math.min(0.52, aspect * 0.26), y: 0.0 };
        radius = 0.3;
      } else {
        anchor = { x: 0, y: 0.235 }; // portrait: sphere above the copy
        radius = Math.min(0.27, aspect * 0.42);
      }
    };

    const toScene = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (cx - rect.left - rect.width / 2) / rect.height,
        y: -(cy - rect.top - rect.height / 2) / rect.height,
      };
    };

    let gl: WebGLRenderingContext | null = null;
    let uniforms: Record<string, WebGLUniformLocation | null> = {};

    function setupGL() {
      // alpha:true so the top of the scene can dissolve into the page's water
      gl = canvas!.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        // Decorative scene — never wake the discrete GPU for it.
        powerPreference: "low-power",
      });
      if (!gl) return false;
      const g = gl;
      const compile = (type: number, src: string) => {
        const s = g.createShader(type)!;
        g.shaderSource(s, src);
        g.compileShader(s);
        if (!g.getShaderParameter(s, g.COMPILE_STATUS)) {
          console.warn("[water-core] shader:", g.getShaderInfoLog(s));
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
      for (const n of [
        "u_res",
        "u_time",
        "u_theme",
        "u_mouse",
        "u_anchor",
        "u_radius",
        "u_reveal",
        "u_ripples[0]",
      ]) {
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
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, DPR_CAP) * resScale;
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl.viewport(0, 0, w, h);
        layout();
      }
    }

    function draw(dt: number) {
      const g = gl;
      if (!g) return;
      resize();
      flowTime += dt * 0.8;
      mx += (tmx - mx) * Math.min(1, dt * 3);
      my += (tmy - my) * Math.min(1, dt * 3);
      themeS += (themeTarget - themeS) * Math.min(1, dt * 3);
      revealS += (revealTarget - revealS) * Math.min(1, dt * 2.2);
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].age += dt;
        if (ripples[i].age > 4) ripples.splice(i, 1);
      }
      rippleData.fill(0);
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        rippleData[i * 4] = r.x;
        rippleData[i * 4 + 1] = r.y;
        rippleData[i * 4 + 2] = r.age;
        rippleData[i * 4 + 3] = r.amp;
      }
      g.uniform2f(uniforms.u_res, canvas!.width, canvas!.height);
      g.uniform1f(uniforms.u_time, flowTime);
      g.uniform1f(uniforms.u_theme, themeS);
      g.uniform2f(uniforms.u_mouse, mx, my);
      g.uniform2f(uniforms.u_anchor, anchor.x, anchor.y);
      g.uniform1f(uniforms.u_radius, radius);
      g.uniform1f(uniforms.u_reveal, reduced ? 1 : revealS);
      g.uniform4fv(uniforms["u_ripples[0]"], rippleData);
      g.drawArrays(g.TRIANGLES, 0, 3);
    }

    // Adaptive governor: resolution steps → static frame. Never jank.
    let ema = 1 / 60;
    let lastGov = performance.now();
    const govStart = lastGov;
    let staticFallback = false;
    let lastDrawn = performance.now();

    const renderOnce = () => draw(1 / 60);

    function frame(now: number) {
      if (destroyed || staticFallback) return;
      if (!inView || document.hidden) {
        raf = 0;
        return;
      } // resumes via observer
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
      const gap = Math.min((now - lastDrawn) / 1000, 0.25);
      lastDrawn = now;
      ema = ema * 0.8 + gap * 0.2;
      if (now - govStart > 900 && now - lastGov > 400) {
        lastGov = now;
        if (ema > 0.08 && resScale > 0.24) {
          resScale = 0.24;
          ema = 0.02;
        } else if (ema > 0.028 && resScale > 0.24) {
          resScale = Math.max(0.24, resScale * 0.7);
          ema = 0.02;
        } else if (ema > 0.06 && resScale <= 0.24) {
          staticFallback = true;
          renderOnce();
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    }
    const kick = () => {
      if (!raf && !destroyed && !reduced && !staticFallback && inView && !document.hidden) {
        last = lastDrawn = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    if (!setupGL()) return; // no WebGL → CSS art direction carries the section

    layout();

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        // Scroll-linked reveal: the core rises and settles as more of the
        // section enters the viewport.
        revealTarget = e.isIntersecting ? Math.min(1, e.intersectionRatio * 1.6) : 0;
        if (inView && reduced) renderOnce();
        kick();
      },
      { rootMargin: "120px", threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75] },
    );
    io.observe(canvas);

    const section = canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      const s = toScene(e.clientX, e.clientY);
      tmx = Math.max(-1, Math.min(1, s.x));
      tmy = Math.max(-0.7, Math.min(0.7, s.y));
    };
    const onDown = (e: PointerEvent) => {
      const s = toScene(e.clientX, e.clientY);
      if (ripples.length >= MAX_RIPPLES) ripples.shift();
      ripples.push({ x: s.x, y: s.y, age: 0, amp: 1 });
      if (reduced) renderOnce();
    };
    const onVis = () => kick();
    const onResize = () => {
      layout();
      if (reduced && inView) renderOnce();
    };
    const themeObs = new MutationObserver(() => {
      themeTarget = document.documentElement.classList.contains("light") ? 1 : 0;
      if (reduced) {
        themeS = themeTarget;
        if (inView) renderOnce();
      }
      kick();
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    addEventListener("resize", onResize);

    if (reduced) renderOnce();
    else kick();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObs.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("resize", onResize);
      cleanupGL?.();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

export function WaterCore() {
  return (
    <section aria-label="The living water core" className="water-core relative overflow-hidden">
      <WaterCoreCanvas />
      {/* pb clears the floating call/WhatsApp cluster and back-to-top on phones */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8 min-h-[92svh] flex items-end lg:items-center pb-44 sm:pb-36 lg:pb-0 pt-[48svh] lg:pt-0">
        <motion.div
          className="max-w-xl lg:max-w-lg"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <MicroLabel n="11">The living water core</MicroLabel>
          <h2
            className="display-xl mt-4 leading-[0.9]"
            style={{ fontSize: "clamp(2.6rem, 8vw, 6rem)" }}
          >
            <span className="grad-text">Purity,</span>
            <br />
            <span className="grad-leaf-text">engineered.</span>
          </h2>
          <p className="mt-6 max-w-md text-white/70">
            Every formulation begins as one measured drop — tested, refined and perfected in
            Cherlapally before it ever reaches your plant.
          </p>
          <div className="mt-9">
            <LiquidButton to="/contact" size="lg">
              Begin your water story
            </LiquidButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
