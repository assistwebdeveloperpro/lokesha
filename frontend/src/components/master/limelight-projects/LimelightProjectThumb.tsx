"use client";

import { Building2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type LimelightProjectThumbProps = {
  src: string | null;
  alt: string;
  className?: string;
};

export default function LimelightProjectThumb({ src, alt, className }: LimelightProjectThumbProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 100vw"
          draggable={false}
          onError={() => setHasError(true)}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-400" aria-hidden>
          <Building2 className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}
