import Image from "next/image";
import { brand } from "@/config/brand";

export function Logo({
  compact = false,
  size = "header",
}: {
  compact?: boolean;
  size?: "header" | "hero";
}) {
  const width = size === "hero" ? 280 : compact ? 108 : 168;
  const height = size === "hero" ? 92 : compact ? 36 : 56;

  return (
    <span className="inline-flex items-center">
      <Image
        src={brand.logoSrc}
        alt={brand.name}
        width={width}
        height={height}
        className={`h-auto w-auto object-contain ${
          size === "hero" ? "max-h-24" : compact ? "max-h-9" : "max-h-14"
        }`}
        priority
      />
      {compact ? <span className="sr-only">{brand.name}</span> : null}
    </span>
  );
}
