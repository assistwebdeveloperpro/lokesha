import {
  POST_PROPERTY_SECTION,
  POST_PROPERTY_SECTION_ACCENT,
  POST_PROPERTY_SECTION_DESC,
  POST_PROPERTY_SECTION_HEADER,
  POST_PROPERTY_SECTION_TITLE,
} from "./postPropertyForm.styles";

type PostPropertyFieldSectionProps = {
  title: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export default function PostPropertyFieldSection({
  title,
  required = false,
  description,
  children,
  className = "",
}: PostPropertyFieldSectionProps) {
  return (
    <section className={`${POST_PROPERTY_SECTION} ${className}`.trim()}>
      <div className={POST_PROPERTY_SECTION_HEADER}>
        <span className={POST_PROPERTY_SECTION_ACCENT} aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className={POST_PROPERTY_SECTION_TITLE}>
            {title}
            {required ? (
              <span className="ml-0.5 text-sky-600" aria-hidden>
                *
              </span>
            ) : null}
          </h3>
          {description ? (
            <p className={POST_PROPERTY_SECTION_DESC}>{description}</p>
          ) : null}
        </div>
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
