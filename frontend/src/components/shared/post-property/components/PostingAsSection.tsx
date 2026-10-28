import { UserCog, Users } from "lucide-react";
import CustomDropdown from "@/components/shared/CustomDropdown";
import {
  isPostingAsId,
  POSTING_AS_OPTIONS,
  type PostingAsId,
} from "../config/postingAs";
import {
  POST_PROPERTY_SECTION,
  POST_PROPERTY_SECTION_ACCENT,
  POST_PROPERTY_SECTION_DESC,
  POST_PROPERTY_SECTION_TITLE,
} from "../config/postPropertyForm.styles";

const PLACEHOLDER_OPTION = { value: "", label: "Select listing type" };

type PostingAsSectionProps = {
  value: PostingAsId | "";
  onChange: (value: PostingAsId) => void;
};

export default function PostingAsSection({ value, onChange }: PostingAsSectionProps) {
  const selectedLabel = POSTING_AS_OPTIONS.find((option) => option.value === value)?.label;

  return (
    <>
      <section className={`${POST_PROPERTY_SECTION} mt-8 sm:mt-10`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <span className={POST_PROPERTY_SECTION_ACCENT} aria-hidden />
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
              <UserCog className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className={POST_PROPERTY_SECTION_TITLE}>Posting this listing as</h2>
              <p className={POST_PROPERTY_SECTION_DESC}>
                Choose the user type to open the matching post property form.
              </p>
            </div>
          </div>

          <div className="w-full md:max-w-xs">
            <CustomDropdown
              id="staff-posting-as"
              label="User type"
              staticLabel
              value={value}
              options={[PLACEHOLDER_OPTION, ...POSTING_AS_OPTIONS]}
              onChange={(next) => {
                if (isPostingAsId(next)) {
                  onChange(next);
                }
              }}
            />
          </div>
        </div>

        {selectedLabel ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-200/70 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden />
            Showing the {selectedLabel} form
          </p>
        ) : null}
      </section>

      {selectedLabel ? null : (
        <section
          className="relative mt-6 flex min-h-[16rem] flex-col items-center justify-center rounded-2xl border-1 border-dashed border-slate-300 bg-gradient-to-br from-white via-white to-sky-50/35 px-4 py-12 text-center sm:mt-8 sm:min-h-[18rem] sm:px-6 sm:py-14"
          role="status"
        >
          <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-sky-50 shadow-sm ring-1 ring-black/5">
            <Users className="h-9 w-9 text-navy-blue" strokeWidth={1.75} aria-hidden />
          </span>
          <h3 className="font-display mt-6 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
            Choose a user type
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            Select a user type above to start filling the property details.
          </p>
        </section>
      )}
    </>
  );
}
