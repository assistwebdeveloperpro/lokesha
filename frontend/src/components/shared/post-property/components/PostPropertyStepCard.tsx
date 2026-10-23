import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import {
  POST_PROPERTY_BACK_BTN,
  POST_PROPERTY_PRIMARY_BTN,
  POST_PROPERTY_STEP_ACCENT,
  POST_PROPERTY_STEP_DESC,
  POST_PROPERTY_STEP_HEADER,
  POST_PROPERTY_STEP_TITLE,
} from "../config/postPropertyForm.styles";

type PostPropertyStepCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onBack?: () => void;
  isActionDisabled?: boolean;
  children: ReactNode;
};

export default function PostPropertyStepCard({
  title,
  description,
  actionLabel,
  onAction,
  onBack,
  isActionDisabled = false,
  children,
}: PostPropertyStepCardProps) {
  return (
    <section
      className={`post-property-form-card mt-8 py-5 px-2 md:p-5 sm:mt-10 ${
        onBack ? "sm:p-6" : "sm:p-8"
      }`}
    >
      {onBack ? (
        <div className="mb-4 flex justify-start">
          <button type="button" onClick={onBack} className={POST_PROPERTY_BACK_BTN}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </button>
        </div>
      ) : null}

      <div className={POST_PROPERTY_STEP_HEADER}>
        <span className={POST_PROPERTY_STEP_ACCENT} aria-hidden />
        <div>
          <h2 className={POST_PROPERTY_STEP_TITLE}>{title}</h2>
          <p className={POST_PROPERTY_STEP_DESC}>{description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {children}

        <div className="flex justify-center border-t border-slate-100/90 bg-linear-to-t from-slate-50/50 to-transparent pt-7">
          <button
            type="button"
            onClick={onAction}
            disabled={isActionDisabled}
            className={`${POST_PROPERTY_PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
