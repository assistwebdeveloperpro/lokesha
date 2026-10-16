import type { ComponentProps } from "react";
import PostPropertyInput from "../PostPropertyInput";
import { formatAmountDisplay, sanitizeAmountRaw } from "../postPropertyAmount";

type PostPropertyAmountInputProps = Omit<
  ComponentProps<typeof PostPropertyInput>,
  "type" | "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
};

export default function PostPropertyAmountInput({
  value,
  onChange,
  ...props
}: PostPropertyAmountInputProps) {
  return (
    <PostPropertyInput
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={formatAmountDisplay(value)}
      onChange={(nextValue) => onChange(sanitizeAmountRaw(nextValue))}
    />
  );
}
