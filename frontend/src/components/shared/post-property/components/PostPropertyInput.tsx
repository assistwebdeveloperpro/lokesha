import FloatingInput from "@/components/shared/FloatingInput";
import type { ComponentProps } from "react";
import { usePostPropertyReadOnly } from "../config/postPropertyReadOnly";
import { renderPostPropertyLabel } from "./PostPropertyRequiredAsterisk";

type PostPropertyInputProps = ComponentProps<typeof FloatingInput>;

export default function PostPropertyInput({
  label,
  ariaLabel,
  readOnly,
  ...props
}: PostPropertyInputProps) {
  const formReadOnly = usePostPropertyReadOnly();
  const displayLabel =
    typeof label === "string" ? renderPostPropertyLabel(label) : label;

  return (
    <FloatingInput
      {...props}
      readOnly={readOnly ?? formReadOnly}
      label={displayLabel}
      ariaLabel={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      mutedText
    />
  );
}
