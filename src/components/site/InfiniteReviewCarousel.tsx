import { useTestimonials } from "@/lib/content";
import { Star, CheckCircle2, User } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useEffect, useState } from "react";

export function InfiniteReviewCarousel() {
  const { data: testimonials } = useTestimonials();

  // Initialize embla carousel with looping enabled and the AutoScroll plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: true,
    },
    [
      AutoScroll({
        playOnInit: true,
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true, // Pauses on hover
      }),
    ]
  );

  const [isReady, setIsReady] = useState(false);

  // We wait for the carousel to be fully initialized to avoid layout shifts or incorrect drag sizes
  useEffect(() => {
    if (emblaApi) setIsReady(true);
  }, [emblaApi]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-10" aria-label="Customer Reviews">
      {/* Fade gradients for smooth edge transitions */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent sm:w-24" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent sm:w-24" />

      <div
        className="overflow-hidden"
        ref={emblaRef}
        style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s ease-in-out" }}
      >
        <div className="flex touch-pan-y" style={{ backfaceVisibility: "hidden" }}>
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4 sm:pl-6"
            >
              <div className="glass-dark h-full flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-transform duration-300 hover:scale-[1.02]">
                <div>
                  {/* Rating */}
                  <div className="mb-4 flex gap-1 text-[#fbbf24]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < parseInt(testimonial.rating || "5")
                            ? "fill-current"
                            : "fill-transparent text-white/20"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/80 mb-6 font-sans">
                    "{testimonial.q}"
                  </p>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.who}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="h-5 w-5 text-white/40" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-foreground">
                        {testimonial.who}
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-hi" />
                    </div>
                    {testimonial.company && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {testimonial.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
