import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { generateAnonymousStudentId, generateSessionId } from "./anonymous-id.ts";
import type { EduActionType, EduStudentState, EduTelemetryContextValue, EduTelemetryEvent } from "./types.ts";

const EduTelemetryContext = createContext<EduTelemetryContextValue | null>(null);

export interface EduTelemetryProviderProps {
  anonId?: string;
  sessionId?: string;
  enabled?: boolean;
  onEvent?: (event: EduTelemetryEvent) => void;
  maxRecentEvents?: number;
  children: React.ReactNode;
}

export function EduTelemetryProvider({
  anonId: customAnonId,
  sessionId: customSessionId,
  enabled = true,
  onEvent,
  maxRecentEvents = 50,
  children,
}: EduTelemetryProviderProps) {
  const [anonId] = useState(() => customAnonId || generateAnonymousStudentId());
  const [sessionId] = useState(() => customSessionId || generateSessionId());
  const [recentEvents, setRecentEvents] = useState<EduTelemetryEvent[]>([]);

  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const recordEvent = useCallback(
    (eventData: Omit<EduTelemetryEvent, "anonId" | "sessionId" | "timestamp">) => {
      if (!enabled) return;

      const fullEvent: EduTelemetryEvent = {
        ...eventData,
        anonId,
        sessionId,
        timestamp: Date.now(),
      };

      setRecentEvents((prev) => [fullEvent, ...prev].slice(0, maxRecentEvents));
      onEventRef.current?.(fullEvent);
    },
    [enabled, anonId, sessionId, maxRecentEvents],
  );

  const value = useMemo<EduTelemetryContextValue>(
    () => ({
      anonId,
      sessionId,
      enabled,
      recordEvent,
      recentEvents,
    }),
    [anonId, sessionId, enabled, recordEvent, recentEvents],
  );

  return <EduTelemetryContext.Provider value={value}>{children}</EduTelemetryContext.Provider>;
}

export interface UseEduTelemetryOptions {
  component: string;
  targetId?: string;
  autoDwellTracking?: boolean;
  struggleDwellThresholdMs?: number;
  maxHesitationThresholdMs?: number;
}

export function useEduTelemetry({
  component,
  targetId,
  autoDwellTracking = true,
  struggleDwellThresholdMs = 120000, // 2 minutes
  maxHesitationThresholdMs = 45000, // 45 seconds
}: UseEduTelemetryOptions) {
  const context = useContext(EduTelemetryContext);
  const mountTimeRef = useRef<number>(Date.now());
  const firstInteractionTimeRef = useRef<number | null>(null);
  const attemptCountRef = useRef<number>(0);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  });

  const record = useCallback(
    (action: EduActionType, state?: EduStudentState, metadata?: Record<string, unknown>) => {
      const now = Date.now();
      const dwellMs = now - mountTimeRef.current;
      const hesitationMs = firstInteractionTimeRef.current
        ? firstInteractionTimeRef.current - mountTimeRef.current
        : dwellMs;

      if (!firstInteractionTimeRef.current && action !== "view") {
        firstInteractionTimeRef.current = now;
      }

      if (action === "retry") {
        attemptCountRef.current += 1;
      }

      // Infer state if not explicitly passed
      let inferredState = state;
      if (!inferredState) {
        if (action === "solve_success") inferredState = "mastery";
        else if (action === "manipulative_drag") inferredState = "explore";
        else if (action === "hint_request" || attemptCountRef.current >= 3) inferredState = "overload";
        else if (dwellMs > struggleDwellThresholdMs) inferredState = "struggle";
        else inferredState = "focus";
      }

      contextRef.current?.recordEvent({
        component,
        action,
        targetId,
        dwellMs,
        hesitationMs,
        retryCount: attemptCountRef.current,
        state: inferredState,
        metadata,
      });
    },
    [component, targetId, struggleDwellThresholdMs],
  );

  useEffect(() => {
    if (!autoDwellTracking) return;

    // Record initial view
    record("view", "focus");

    // Check for struggle after threshold
    const timer = setTimeout(() => {
      if (!firstInteractionTimeRef.current) {
        record("hesitation", "struggle", { reason: "extended_no_input" });
      }
    }, maxHesitationThresholdMs);
    (timer as any)?.unref?.();
    dwellTimerRef.current = timer;

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      const finalDwellMs = Date.now() - mountTimeRef.current;
      if (finalDwellMs > 1000) {
        contextRef.current?.recordEvent({
          component,
          action: "dwell",
          targetId,
          dwellMs: finalDwellMs,
          state: finalDwellMs > struggleDwellThresholdMs ? "struggle" : "focus",
        });
      }
    };
  }, [autoDwellTracking, component, targetId, maxHesitationThresholdMs, struggleDwellThresholdMs, record]);

  const telemetryProps = useMemo(
    () => ({
      "data-edu-telemetry": component,
      "data-edu-target-id": targetId,
      "data-edu-anon-id": context?.anonId,
    }),
    [component, targetId, context?.anonId],
  );

  return {
    anonId: context?.anonId,
    sessionId: context?.sessionId,
    recordAction: record,
    telemetryProps,
  };
}
