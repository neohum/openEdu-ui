export type EduActionType =
  | "view"
  | "focus"
  | "blur"
  | "click"
  | "input"
  | "dwell"
  | "hesitation"
  | "retry"
  | "hint_request"
  | "struggle_detected"
  | "manipulative_drag"
  | "solve_success";

export type EduStudentState =
  | "focus"
  | "struggle"
  | "idle"
  | "mastery"
  | "overload"
  | "explore";

export interface EduTelemetryEvent {
  /** Zero PII: Ephemeral anonymous hash identifier (e.g., 'anon_s_9a2b8c') */
  anonId: string;
  /** Session identifier for the active learning run */
  sessionId: string;
  /** Target component name (e.g. 'ItemRenderer', 'Button', 'TextField') */
  component: string;
  /** Behavioral action type */
  action: EduActionType;
  /** Target item or question ID */
  targetId?: string;
  /** Event timestamp (ISO 8601 or epoch ms) */
  timestamp: number;
  /** Dwell time in milliseconds */
  dwellMs?: number;
  /** Hesitation latency before first interaction in milliseconds */
  hesitationMs?: number;
  /** Consecutive retry count */
  retryCount?: number;
  /** Inferred or observed behavioral state */
  state?: EduStudentState;
  /** Non-PII contextual metadata */
  metadata?: Record<string, unknown>;
}

export interface EduTelemetryContextValue {
  anonId: string;
  sessionId: string;
  enabled: boolean;
  recordEvent: (event: Omit<EduTelemetryEvent, "anonId" | "sessionId" | "timestamp">) => void;
  recentEvents: EduTelemetryEvent[];
}
