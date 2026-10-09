import { POST_PROPERTY_REQUIRED_ASTERISK } from "./postPropertyForm.styles";

export default function PostPropertyRequiredAsterisk() {
  return (
    <span className={POST_PROPERTY_REQUIRED_ASTERISK} aria-hidden>
      *
    </span>
  );
}

export function renderPostPropertyLabel(label: string) {
  if (!label.endsWith("*")) {
    return label;
  }

  return (
    <>
      {label.slice(0, -1)}
      <PostPropertyRequiredAsterisk />
    </>
  );
}
