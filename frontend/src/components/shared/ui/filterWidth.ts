import type { CSSProperties } from "react";
import type { DropdownOption } from "@/components/shared/CustomDropdown";

const MIN_CHARS = 8;
const CONTROL_CHROME = "4.5rem";

// Sizes a dropdown filter to its longest option or label text.
export function getDropdownFilterStyle(label: string, options: DropdownOption[]): CSSProperties {
  const longestOption = options.reduce(
    (max, option) => (typeof option.label === "string" ? Math.max(max, option.label.length) : max),
    0,
  );
  const chars = Math.max(longestOption, label.length, MIN_CHARS);

  return { width: `calc(${chars}ch + ${CONTROL_CHROME})`, maxWidth: "100%" };
}
