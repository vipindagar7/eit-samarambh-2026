// Small helpers shared by the OTP flow.

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000; // an individual OTP code is valid 5 min
export const RESEND_WAIT_SECONDS = 30; // how long the frontend waits before offering "resend" / "try email instead"
export const MAX_ATTEMPTS_PER_CHANNEL = 2; // how many OTP sends allowed per channel (mobile, email)

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits, no leading zero issues
}
