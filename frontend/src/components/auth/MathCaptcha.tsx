"use client";

import { RefreshCw } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export type MathChallenge = {
  num1: number;
  num2: number;
  answer: number;
};

export function createMathChallenge(): MathChallenge {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return { num1, num2, answer: num1 + num2 };
}

export type MathCaptchaHandle = {
  validate: (userAnswer: string) => boolean;
  refresh: () => void;
};

type MathCaptchaProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onClearError?: () => void;
};

const MathCaptcha = forwardRef<MathCaptchaHandle, MathCaptchaProps>(
  function MathCaptcha({ id, value, onChange, error, onClearError }, ref) {
    const [challenge, setChallenge] = useState<MathChallenge | null>(null);

    const refresh = () => {
      setChallenge(createMathChallenge());
    };

    useEffect(() => {
      refresh();
    }, []);

    useImperativeHandle(ref, () => ({
      validate: (userAnswer: string) => {
        if (!challenge) return false;
        return Number(userAnswer.trim()) === challenge.answer;
      },
      refresh,
    }));

    return (
      <div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex h-13 w-full shrink-0 items-center justify-between gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/80 px-4 sm:w-auto sm:justify-start">
            <span className="select-none text-lg font-bold text-sky-800">
              {challenge ? `${challenge.num1} + ${challenge.num2} =` : "··· + ··· ="}
            </span>
            <button
              type="button"
              onClick={() => {
                refresh();
                onChange("");
                onClearError?.();
              }}
              className="rounded-lg p-1 text-sky-700 transition hover:bg-sky-100"
              aria-label="Refresh math question"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              onClearError?.();
            }}
            placeholder="Enter answer"
            aria-invalid={Boolean(error)}
            className={`h-13 min-w-0 w-full rounded-xl border bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none sm:flex-1 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            }`}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

export default MathCaptcha;
