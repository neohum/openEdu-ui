/**
 * Privacy-Preserving Zero-PII Anonymous Token Generator
 *
 * Guarantees that no student names, emails, IPs, or device fingerprints
 * are ever collected or stored. Each session uses an ephemeral, non-reversible random token.
 */
export function generateAnonymousStudentId(prefix = "anon_s_"): string {
  // Use crypto.randomUUID or fallback pseudo-random token
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    const raw = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
    return `${prefix}${raw}`;
  }
  const randomHex = Math.random().toString(16).substring(2, 12);
  return `${prefix}${randomHex}`;
}

export function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).substring(2, 8);
  return `sess_${ts}_${rnd}`;
}
