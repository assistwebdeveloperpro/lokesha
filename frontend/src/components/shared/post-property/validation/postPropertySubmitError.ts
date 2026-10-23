import { ApiError } from "@/services/apiClient";

export const GENERIC_SUBMIT_ERROR = "Something went wrong. Please try again.";

export const isUnauthorizedError = (error: unknown) =>
  error instanceof ApiError && error.status === 401;

export function getSubmitErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return GENERIC_SUBMIT_ERROR;
  }

  return error.errors?.[0] ?? error.message;
}
