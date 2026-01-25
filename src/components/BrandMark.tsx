import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/selfera-app-logo.png";

type BrandMarkProps = {
  alt?: string;
  className?: string;
  imgClassName?: string;
};

const DEFAULT_CONTAINER = "h-11 w-[180px] sm:w-[210px] md:w-[240px]";
const DEFAULT_IMG_SCALE = "scale-[4.5]";

/**
 * BrandMark
 * 
 * This logo asset has extra transparent padding; we render it inside an overflow-hidden
 * box and scale it so the visible mark matches expected navbar sizing.
 */
export const BrandMark = forwardRef<HTMLDivElement, BrandMarkProps>(
  function BrandMark({ alt = "SelfERA", className, imgClassName }, ref) {
    return (
      <div ref={ref} className={cn("relative overflow-hidden", DEFAULT_CONTAINER, className)}>
        <img
          src={logo}
          alt={alt}
          loading="eager"
          className={cn(
            "h-full w-auto max-w-none object-contain origin-left",
            DEFAULT_IMG_SCALE,
            imgClassName
          )}
        />
      </div>
    );
  }
);
