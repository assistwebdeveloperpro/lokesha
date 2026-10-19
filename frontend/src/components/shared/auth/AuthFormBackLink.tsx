"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AuthFormBackLinkProps = {
  label?: string;
  className?: string;
} & (
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }
);

export default function AuthFormBackLink({
  label = "Back",
  className,
  ...props
}: AuthFormBackLinkProps) {
  const classNames = cn(
    "mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-sky-700 lg:mb-3",
    className,
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classNames}>
        <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={classNames}>
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
