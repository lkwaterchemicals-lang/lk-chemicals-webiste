// Boot scheduling + asynchronous shader linking for the site's WebGL layers
// (WaterCanvas, WaterCore).
//
// Why this exists: first visits used to freeze devices. Both full-screen
// fragment shaders compiled SYNCHRONOUSLY while React was still hydrating —
// and on a cold driver cache (exactly the first visit) ANGLE's GLSL→HLSL
// translation can block the main thread for hundreds of milliseconds to
// seconds. Repeat visits hit the driver's shader disk cache, which is why
// only the first open ever felt stuck. Two rules fix that permanently:
//
//   1. No GL work on the critical path. Init waits for two painted frames and
//      then an idle slot, so hydration and first paint always win. The boot
//      splash/veil covers the hand-off; the canvases fade in when ready.
//   2. Never block on the link. With KHR_parallel_shader_compile the driver
//      compiles on background threads while we poll COMPLETION_STATUS; without
//      it (Safari) the sync cost lands inside the idle slot instead of the
//      hydration frame.
//
// Callers must also pass failIfMajorPerformanceCaveat when creating their
// context: on software GL (SwiftShader — no GPU or a blocklisted driver) a
// full-screen fragment shader rasterizes on the CPU and pegs every core, so
// those machines get the CSS art direction instead of a shader at all.

/** Run `cb` after the page has painted twice AND the main thread is idle. */
export function whenBootIdle(cb: () => void, timeout = 900): () => void {
  let cancelled = false;
  let raf = 0;
  let idleId = 0;
  let timerId = 0;
  const run = () => {
    if (!cancelled) cb();
  };
  raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(() => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(run, { timeout });
      } else {
        timerId = window.setTimeout(run, 250);
      }
    });
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
    if (idleId) window.cancelIdleCallback?.(idleId);
    clearTimeout(timerId);
  };
}

/**
 * Resolve a program link without ever forcing a synchronous compile on the
 * caller's frame. Calls `onDone(ok)` once the driver has finished; `ok` is
 * false on compile/link failure or a lost context. Returns a cancel function.
 */
export function linkProgramAsync(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  onDone: (ok: boolean) => void,
): () => void {
  let cancelled = false;
  let timer = 0;
  const finish = () => {
    if (cancelled) return;
    onDone(!gl.isContextLost() && gl.getProgramParameter(program, gl.LINK_STATUS) === true);
  };
  const ext = gl.getExtension("KHR_parallel_shader_compile") as {
    COMPLETION_STATUS_KHR: number;
  } | null;
  if (!ext) {
    timer = window.setTimeout(finish, 30);
  } else {
    const poll = () => {
      if (cancelled) return;
      if (gl.isContextLost() || gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
        finish();
      } else {
        timer = window.setTimeout(poll, 60);
      }
    };
    timer = window.setTimeout(poll, 60);
  }
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
