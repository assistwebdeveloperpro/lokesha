import FloatingInput from "@/components/shared/FloatingInput";
import { usePostPropertyReadOnly } from "@/components/shared/post-property/config/postPropertyReadOnly";
import type { ComponentProps } from "react";
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
