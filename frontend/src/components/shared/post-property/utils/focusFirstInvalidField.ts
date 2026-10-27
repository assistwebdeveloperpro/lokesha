const FORM_SELECTOR = "[data-post-property-form]";
const FOCUSABLE_SELECTOR = "input:not([type='hidden']), textarea, select, button";

// Returns false when no invalid field is on screen yet
export function focusFirstInvalidField(): boolean {
  const form = document.querySelector(FORM_SELECTOR);
  const message = form?.querySelector<HTMLElement>("[role='alert']");
  const field = message?.parentElement;

  if (!field) {
    return false;
  }

  field.scrollIntoView({ behavior: "smooth", block: "center" });
  field.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus({ preventScroll: true });

  return true;
}
