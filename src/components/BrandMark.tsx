import { cn } from "@/lib/utils";
import logo from "@/assets/selfera-app-logo.png";

type BrandMarkProps = {
  alt?: string;
  className?: string;
  imgClassName?: string;
};

/**
 * BrandMark
 * 
 * This logo asset has extra transparent padding; we render it inside an overflow-hidden
 * box and scale it so the visible mark matches expected navbar sizing.
 */
export function BrandMark({
  alt = "SelfERA",
  className,
  imgClassName,
}: BrandMarkProps) {
  return (
    <div className={cn("relative overflow-hidden", className ?? "h-10 w-[156px]")}> 
      <img
        src={logo}
        alt={alt}
        loading="eager"
        className={cn(
          "h-full w-auto max-w-none object-contain origin-left scale-[1.8]",
          imgClassName
        )}
      />
    </div>
  );
}
