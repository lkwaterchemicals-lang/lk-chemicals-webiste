// The company brand film — a piece of the page that can become a cinema.
//
// At rest it behaves like set dressing: it autoplays muted, loops, pauses the
// moment it scrolls away, and shows no chrome at all. Reach for it and it
// becomes a proper player — scrubber, play/pause, sound, fullscreen — which
// then gets out of the way again a couple of seconds after you stop touching
// it. What it never becomes is a download surface: no control bar of the
// browser's own, no picture-in-picture, no "Save video as…".
//
// Three gates stand between a visitor and the bytes, in order:
//   · nothing at all until the section is within 400px of the viewport;
//   · then the Cloudinary poster frame, which fills the 16:9 box by itself;
//   · then the film, faded in once — and only once — when it can play.
// The 16:9 box belongs to the host element, so none of that moves the page a
// single pixel and fullscreen never collapses the layout behind it.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "motion/react";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { filmSources } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Rendition widths worth asking Cloudinary for. Three rungs, not a continuum:
 * every distinct width is a separate derivative to transcode and cache, and a
 * phone asking for 411px-worth would sit through a cold transform to save a
 * few hundred KB over the 640 rung. */
const LADDER = [640, 960, 1280];
const rungFor = (cssWidth: number, dpr: number) => {
  // Capped at 1.5x rather than the full device ratio: motion hides the
  // softness that would be obvious in a still, and the rung below is a third
  // less data on exactly the phones that can least afford it.
  const want = cssWidth * Math.min(dpr, 1.5);
  return LADDER.find((w) => w >= want) ?? LADDER[LADDER.length - 1];
};

const clock = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/** iOS Safari refuses fullscreen on anything but the <video> itself, where it
 * hands over to the native player. Worth the cast — the alternative on an
 * iPhone is a fullscreen button that silently does nothing. */
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export function BrandFilm({
  src,
  label,
  poster,
  className,
}: {
  /** Cloudinary secure_url of the film. */
  src: string;
  /** Describes the film itself, not the controls — it names the <video>. */
  label: string;
  /** Still shown before (and instead of) the film. Defaults to a frame of it. */
  poster?: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Which input opened the last interaction — a finger wants the controls, a
   * mouse wants to act on the thing it clicked. */
  const pointerKind = useRef<string>("mouse");

  // Two observers, two jobs. `near` arms the loading (once, generously early);
  // `onScreen` drives play/pause and keeps flipping for the life of the page.
  // Both margins are written vertical-first: a bare "400px" would also expand
  // the root box sideways, which is the shape of bug that has bitten the
  // reveal animations in this file's neighbours.
  const near = useInView(hostRef, { once: true, margin: "400px 0px" });
  const onScreen = useInView(hostRef, { amount: 0.3 });

  const [reduced, setReduced] = useState(false);
  // Set by the visitor pressing play. It overrides prefers-reduced-motion —
  // that setting means "don't move without being asked", not "never move".
  const [asked, setAsked] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [shown, setShown] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [everPlayed, setEverPlayed] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [uiAwake, setUiAwake] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Chromium answers "maybe" for the HLS MIME type and then cannot decode a
  // byte of it (measured in Edge). Listing the .m3u8 as a <source> there means
  // the element picks it, stalls, and the film arrives late or never — so the
  // adaptive ladder goes only to engines that answer "probably", which is
  // Safari and iOS. Everything else takes the progressive file, which is
  // already quality- and format-negotiated by Cloudinary.
  //
  // null until the probe has run, which also holds the <video> back until its
  // source list is final: swapping sources under a live element does nothing.
  // The measured width rides along for the same reason — it has to be decided
  // before the element exists, and re-deciding it on resize would restart the
  // film mid-sentence for the sake of a sharper picture nobody asked for.
  const [plan, setPlan] = useState<{ hls: boolean; width: number } | null>(null);

  const nativeHls = plan?.hls ?? false;
  const film = useMemo(
    () => filmSources(src, plan?.width ?? LADDER[LADDER.length - 1]),
    [src, plan?.width],
  );
  const still = poster || film.poster;
  const autoplay = !reduced || asked;
  const armed = near && plan !== null;
  const progress = duration > 0 ? time / duration : 0;

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const probe = document.createElement("video");
    // The box has its aspect ratio reserved from first paint, so the slot is
    // already the right size to measure even though nothing has loaded.
    const css = hostRef.current?.getBoundingClientRect().width ?? 0;
    setPlan({
      hls: probe.canPlayType("application/vnd.apple.mpegurl") === "probably",
      width: rungFor(css || window.innerWidth, window.devicePixelRatio || 1),
    });
  }, []);

  /* ------------------------------------------------------- element events */

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => {
      setPlaying(true);
      setEverPlayed(true);
      setBlocked(false);
    };
    const onPause = () => setPlaying(false);
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onBuffer = () =>
      setBuffered(v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0);
    const onVolume = () => setMuted(v.muted);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("progress", onBuffer);
    v.addEventListener("volumechange", onVolume);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("progress", onBuffer);
      v.removeEventListener("volumechange", onVolume);
    };
  }, [armed]);

  /* ------------------------------------------------------------- playback */

  // Play while it is on screen and wanted; pause otherwise. A rejected play()
  // is an autoplay policy refusal, not an error — it just means the visitor
  // has to ask, so surface the button instead of failing silently. Fullscreen
  // is exempt: the observer's idea of "on screen" is meaningless once the
  // element owns the whole display.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !armed || fullscreen) return;
    if (onScreen && autoplay) v.play().catch(() => setBlocked(true));
    else v.pause();
  }, [armed, onScreen, autoplay, fullscreen]);

  // A film left decoding in a background tab burns battery for nobody.
  useEffect(() => {
    const onVisibility = () => {
      const v = videoRef.current;
      if (!v || fullscreen) return;
      if (document.hidden) v.pause();
      else if (onScreen && autoplay) v.play().catch(() => setBlocked(true));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [onScreen, autoplay, fullscreen]);

  /* ----------------------------------------------------------- fullscreen */

  useEffect(() => {
    const onChange = () => {
      const on = document.fullscreenElement === frameRef.current;
      setFullscreen(on);
      const v = videoRef.current;
      if (!v) return;
      // Fullscreen is an unambiguous "I want to watch this properly", so the
      // film finds its voice there and loses it again on the way out. The
      // ambient loop on the page never talks at anyone unprompted, which is
      // the whole reason it is allowed to autoplay in the first place.
      v.muted = !on;
      setMuted(!on);
      if (on) {
        setAsked(true);
        v.play().catch(() => setBlocked(true));
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const frame = frameRef.current;
    const toNative = () => (videoRef.current as IosVideo | null)?.webkitEnterFullscreen?.();
    if (frame?.requestFullscreen) frame.requestFullscreen().catch(toNative);
    else toNative();
  }, []);

  /* ------------------------------------------------------------- controls */

  const wake = useCallback(() => {
    setUiAwake(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setUiAwake(false), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setAsked(true);
    if (v.paused) v.play().catch(() => setBlocked(true));
    else v.pause();
    wake();
  }, [wake]);

  const toggleSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => setBlocked(true));
    wake();
  }, [wake]);

  const seekTo = useCallback((fraction: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(1, Math.max(0, fraction)) * v.duration;
    setTime(v.currentTime);
  }, []);

  const seekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration)) return;
      v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + delta));
      setTime(v.currentTime);
      wake();
    },
    [wake],
  );

  const fractionAt = (clientX: number) => {
    const box = barRef.current?.getBoundingClientRect();
    if (!box?.width) return 0;
    return (clientX - box.left) / box.width;
  };

  // Paused means the visitor is deciding, so the chrome stays put; playing
  // means they are watching, so it leaves.
  const controlsOpen = armed && (uiAwake || scrubbing || (everPlayed && !playing));
  // Never flashes on the way back into view: `playing` lags the resume by a
  // frame or two, and a 300ms fade never gets far enough to be seen.
  const showCentrePlay = armed && !playing && (everPlayed || blocked || (reduced && !asked));

  const onKeyDown = (e: React.KeyboardEvent) => {
    const onButton = (e.target as HTMLElement).closest("button");
    switch (e.key) {
      case " ":
      case "k":
        if (onButton) return; // let the focused control answer for itself
        e.preventDefault();
        togglePlay();
        break;
      case "m":
        toggleSound();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "ArrowLeft":
        e.preventDefault();
        seekBy(-5);
        break;
      case "ArrowRight":
        e.preventDefault();
        seekBy(5);
        break;
      default:
    }
  };

  // drop-shadow, not a filled pill: over a strong scrim a bare white glyph
  // reads on any frame the film happens to be showing, and stays out of the
  // way of the picture in a way a row of solid chips would not.
  const iconBtn =
    "grid place-items-center rounded-full text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] " +
    "transition duration-200 hover:bg-white/20 focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-white/80";

  return (
    // The host owns the 16:9 box, so the page keeps its shape even while the
    // frame is away in the top layer being fullscreen.
    <div ref={hostRef} className={cn("relative aspect-video w-full", className)}>
      <div
        ref={frameRef}
        onKeyDown={onKeyDown}
        onPointerMove={wake}
        onPointerLeave={() => playing && setUiAwake(false)}
        className={cn(
          "group isolate",
          fullscreen
            ? "fixed inset-0 h-full w-full bg-black"
            : cn(
                "absolute inset-0 overflow-hidden rounded-[24px]",
                "bg-ink/5 ring-1 ring-ink/10 dark:bg-white/5 dark:ring-white/10",
                "shadow-[0_28px_64px_-24px_rgba(10,26,54,0.45)]",
                "dark:shadow-[0_28px_72px_-28px_rgba(0,0,0,0.85)]",
              ),
        )}
      >
        {still && (
          <img
            src={still}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full",
              fullscreen ? "object-contain" : "object-cover",
            )}
          />
        )}

        {armed && (
          <video
            ref={videoRef}
            aria-label={label}
            poster={still || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            // No control bar of the browser's own to strip, but this also
            // prunes Chrome's media context menu; onContextMenu removes
            // "Save video as…" outright.
            controlsList="nodownload noplaybackrate noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
            onCanPlay={() => setShown(true)}
            className={cn(
              "absolute inset-0 h-full w-full",
              fullscreen ? "object-contain" : "object-cover",
              // Opacity only — a transform or filter here would cost the
              // compositor work on every frame of a scroll.
              "transition-opacity duration-700 ease-out",
              shown ? "opacity-100" : "opacity-0",
            )}
          >
            {nativeHls && film.hls && (
              <source src={film.hls} type="application/vnd.apple.mpegurl" />
            )}
            {/* Intentionally untyped — see filmSources() in lib/media.ts. */}
            <source src={film.file} />
          </video>
        )}

        {/* The film is the biggest hit area on screen. A mouse expects it to
            toggle playback; a finger expects it to summon the chrome first. */}
        {armed && (
          <button
            type="button"
            // A pointer convenience only. The control bar below carries the
            // real, labelled play/pause button, and announcing this one too
            // would put the same command in the tab order twice.
            aria-hidden="true"
            tabIndex={-1}
            onPointerDown={(e) => (pointerKind.current = e.pointerType)}
            onClick={() => {
              if (pointerKind.current === "touch" && !controlsOpen) wake();
              else togglePlay();
            }}
            className="absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none"
          />
        )}

        {/* Corner glass, so the rounding reads as a lens rather than a crop. */}
        {!fullscreen && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10"
          />
        )}

        {/* ------------------------------------------------- centre play --- */}
        <div
          aria-hidden="true"
          className={cn(
            "lk-on-film pointer-events-none absolute inset-0 grid place-items-center",
            "bg-gradient-to-t from-ink/50 via-ink/10 to-transparent",
            "transition-opacity duration-300",
            showCentrePlay ? "opacity-100" : "opacity-0",
          )}
        >
          <span
            className={cn(
              "grid h-16 w-16 place-items-center rounded-full sm:h-20 sm:w-20",
              // Dark glass, not light: the film opens on a sunrise, and a
              // translucent white disc over that was a grey smudge.
              "bg-black/45 text-white ring-1 ring-white/50 backdrop-blur-md",
              "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)]",
              "transition-transform duration-300 group-hover:scale-105",
            )}
          >
            <Play className="ml-0.5 h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" strokeWidth={0} />
          </span>
        </div>

        {/* -------------------------------------------------- control bar -- */}
        {armed && (
          <div
            className={cn(
              "lk-on-film absolute inset-x-0 bottom-0 transition-all duration-300 ease-out",
              // Heavy enough to carry white chrome over the brightest frame in
              // the film — this one opens on a sunrise, and it has a burnt-in
              // red lower third exactly where the play button sits.
              "bg-gradient-to-t from-black/90 via-black/55 to-transparent",
              fullscreen ? "px-5 pt-20 pb-5 sm:px-8 sm:pb-7" : "px-3 pt-16 pb-3 sm:px-4 sm:pb-4",
              controlsOpen
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0",
            )}
          >
            <div
              ref={barRef}
              role="slider"
              tabIndex={0}
              aria-label="Seek through the film"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration) || 0}
              aria-valuenow={Math.round(time)}
              aria-valuetext={`${clock(time)} of ${clock(duration)}`}
              onPointerDown={(e) => {
                e.preventDefault();
                barRef.current?.setPointerCapture(e.pointerId);
                setScrubbing(true);
                seekTo(fractionAt(e.clientX));
              }}
              onPointerMove={(e) => scrubbing && seekTo(fractionAt(e.clientX))}
              onPointerUp={(e) => {
                barRef.current?.releasePointerCapture(e.pointerId);
                setScrubbing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Home") seekTo(0);
                if (e.key === "End") seekTo(0.999);
              }}
              className="group/bar relative flex h-4 w-full cursor-pointer touch-none items-center focus-visible:outline-none"
            >
              <div className="relative h-[3px] w-full rounded-full bg-white/25 group-focus-visible/bar:ring-2 group-focus-visible/bar:ring-white/70">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/35"
                  style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }}
                />
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full bg-white",
                    // timeupdate lands at ~4Hz and would tick visibly; a linear
                    // ease across the gap costs nothing and reads as motion.
                    !scrubbing && "transition-[width] duration-200 ease-linear",
                  )}
                  style={{ width: `${progress * 100}%` }}
                />
                <div
                  className={cn(
                    "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white",
                    "shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-200",
                    scrubbing ? "scale-100" : "scale-0 group-hover/bar:scale-100",
                  )}
                  style={{ left: `${progress * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-1 flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause the film" : "Play the film"}
                className={cn(iconBtn, "h-9 w-9 sm:h-10 sm:w-10")}
              >
                {playing ? (
                  <Pause className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="currentColor" />
                ) : (
                  <Play
                    className="ml-0.5 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                )}
              </button>

              <span className="ml-1 font-mono text-[11px] tabular-nums text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-xs">
                {clock(time)} <span className="text-white/60">/ {clock(duration)}</span>
              </span>

              <span className="flex-1" />

              <button
                type="button"
                onClick={toggleSound}
                aria-label={muted ? "Unmute the film" : "Mute the film"}
                aria-pressed={!muted}
                className={cn(iconBtn, "h-9 w-9 sm:h-10 sm:w-10")}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Watch fullscreen"}
                aria-pressed={fullscreen}
                className={cn(iconBtn, "h-9 w-9 sm:h-10 sm:w-10")}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
