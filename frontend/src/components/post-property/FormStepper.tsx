import { FORM_STEPS, getStepperLineProgress } from "./postPropertyForm.shared";

const STEP_COUNT = FORM_STEPS.length;
const CIRCLE_RADIUS = "1.25rem";
const LINE_HEIGHT_CLASS = "h-1.5";
const LINE_TOP_CLASS = "top-[17px]";

export default function FormStepper({ currentStep }: { currentStep: number }) {
  const lineProgress = getStepperLineProgress(currentStep);

  return (
    <nav aria-label="Property listing steps" className="w-full overflow-visible">
      <div className="post-property-stepper rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-sky-50/25 px-4 py-5 ring-1 ring-slate-100/60 sm:px-6 sm:py-6">
        <div className="relative w-full overflow-visible">
          <div
            className={`absolute ${LINE_TOP_CLASS} ${LINE_HEIGHT_CLASS} bg-slate-300`}
            style={{
              left: CIRCLE_RADIUS,
              width: `calc(100% - ${CIRCLE_RADIUS} * 2)`,
            }}
            aria-hidden
          />
          <div
            className={`absolute ${LINE_TOP_CLASS} ${LINE_HEIGHT_CLASS} bg-navy-blue transition-all duration-300`}
            style={{
              left: CIRCLE_RADIUS,
              width: `calc((100% - ${CIRCLE_RADIUS} * 2) * ${lineProgress / 100})`,
            }}
            aria-hidden
          />

          <ol className="relative w-full overflow-visible pb-14 sm:pb-16">
            {FORM_STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isFirst = index === 0;
              const isLast = index === STEP_COUNT - 1;
              const position = index / (STEP_COUNT - 1);

              return (
                <li
                  key={step.id}
                  className={`absolute top-0 flex flex-col ${
                    isFirst
                      ? "left-0 items-start"
                      : isLast
                        ? "right-0 items-end"
                        : "-translate-x-1/2 items-center"
                  }`}
                  style={
                    isFirst || isLast
                      ? undefined
                      : {
                          left: `calc(${CIRCLE_RADIUS} + (100% - ${CIRCLE_RADIUS} * 2) * ${position})`,
                        }
                  }
                >
                  <span
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white p-0.5 ${
                      isActive || isCompleted ? "border-navy-blue" : "border-slate-500"
                    }`}
                  >
                    <span
                      className={`flex h-full w-full items-center justify-center rounded-full text-sm font-semibold text-white ${
                        isActive || isCompleted ? "bg-navy-blue" : "bg-slate-600"
                      }`}
                    >
                      {step.id}
                    </span>
                  </span>
                  <span
                    className={`mt-3 hidden whitespace-nowrap text-sm leading-snug text-gray-600 sm:block ${
                      isActive ? "font-semibold text-gray-800" : "font-semibold"
                    } ${isFirst ? "text-left" : isLast ? "text-right" : "text-center"}`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 text-center text-base font-semibold text-gray-500 sm:hidden">
            {FORM_STEPS[currentStep - 1]?.label}
          </p>
        </div>
      </div>
    </nav>
  );
}
