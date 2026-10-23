import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  authFormDescriptionClassName,
  authFormTitleClassName,
} from "@/components/shared/auth/authTypography";

type AuthFormHeadingProps = {
  title: string;
  description?: ReactNode;
  className?: string;
};

export default function AuthFormHeading({
  title,
  description,
  className,
}: AuthFormHeadingProps) {
  return (
    <header
      className={cn(
        "border-b border-slate-100 pb-4 sm:pb-[1.125rem]",
        className,
      )}
    >
      <h1 className={authFormTitleClassName}>{title}</h1>
      {description ? (
        <p className={authFormDescriptionClassName}>{description}</p>
      ) : null}
    </header>
  );
}
