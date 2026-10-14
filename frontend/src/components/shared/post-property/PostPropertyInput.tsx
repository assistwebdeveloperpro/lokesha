import FloatingInput from "@/components/shared/FloatingInput";
import type { ComponentProps } from "react";
import { renderPostPropertyLabel } from "./PostPropertyRequiredAsterisk";

type PostPropertyInputProps = ComponentProps<typeof FloatingInput>;

export default function PostPropertyInput({
  label,
  ariaLabel,
  ...props
}: PostPropertyInputProps) {
  const displayLabel =
    typeof label === "string" ? renderPostPropertyLabel(label) : label;

  return (
    <FloatingInput
      {...props}
      label={displayLabel}
      ariaLabel={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      mutedText
    />
  );
}
