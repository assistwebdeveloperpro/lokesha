"use client";

import { useCallback, useEffect, useState } from "react";

export const OTP_RESEND_SECONDS = 60;

export function useOtpCountdown(initialSeconds = OTP_RESEND_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timerId = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timerId);
  }, [secondsLeft]);

  const restart = useCallback(() => setSecondsLeft(initialSeconds), [initialSeconds]);

  return { secondsLeft, isExpired: secondsLeft <= 0, restart };
}
