/**
 * Reads a user-safe message from API error responses (matches backend auth/error JSON shape).
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Try again.") {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") {
    return fallback;
  }

  if (typeof data.message === "string") {
    const trimmed = data.message.trim();
    if (trimmed.length > 0 && trimmed.length <= 280) {
      return trimmed;
    }
  }

  if (data.fields && typeof data.fields === "object") {
    const first = Object.values(data.fields).find((v) => typeof v === "string" && v.trim());
    if (first) return first.trim();
  }

  const status = error.response?.status;
  if (status === 409) return "This email is already registered.";
  if (status === 401) return "Invalid email or password.";
  if (status === 403) return "You don’t have access to do that.";

  return fallback;
}
