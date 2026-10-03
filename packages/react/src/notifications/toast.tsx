import React, { useEffect, useState } from "react";
import "./notifications.css";

export type ToastTone = "default" | "info" | "success" | "warning" | "danger";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;
type DismissListener = (id: string) => void;

const listeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

export const toast = (
  title: string,
  options?: { description?: string; tone?: ToastTone; duration?: number }
) => {
  const item: ToastItem = {
    id: Math.random().toString(36).substring(2, 9),
    title,
    description: options?.description,
    tone: options?.tone || "default",
    duration: options?.duration ?? 4000,
  };
  listeners.forEach((fn) => fn(item));
  return item.id;
};

toast.success = (title: string, desc?: string) =>
  toast(title, { description: desc, tone: "success" });
toast.info = (title: string, desc?: string) =>
  toast(title, { description: desc, tone: "info" });
toast.warning = (title: string, desc?: string) =>
  toast(title, { description: desc, tone: "warning" });
toast.danger = (title: string, desc?: string) =>
  toast(title, { description: desc, tone: "danger" });
toast.dismiss = (id: string) => {
  dismissListeners.forEach((fn) => fn(id));
};

export interface ToasterProps {
  position?: "top-right" | "top-center" | "bottom-right";
}

export function Toaster({ position = "top-right" }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (item: ToastItem) => {
      setToasts((prev) => [item, ...prev]);

      if (item.duration && item.duration > 0) {
        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== item.id));
        }, item.duration);
        (timer as any)?.unref?.();
      }
    };

    const handleDismiss = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    listeners.add(handleToast);
    dismissListeners.add(handleDismiss);

    return () => {
      listeners.delete(handleToast);
      dismissListeners.delete(handleDismiss);
    };
  }, []);

  return (
    <div
      className={["oe-toaster-container", `oe-toaster--${position}`].join(" ")}
      aria-live="polite"
      aria-label="알림"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "oe-toast",
            `oe-toast--${t.tone}`,
            "oe-glass",
            "oe-glass--frosted",
          ].join(" ")}
          role="status"
        >
          <div className="oe-toast__body">
            <p className="oe-toast__title">{t.title}</p>
            {t.description && (
              <p className="oe-toast__desc">{t.description}</p>
            )}
          </div>
          <button
            type="button"
            className="oe-toast__close"
            onClick={() => toast.dismiss(t.id)}
            aria-label="알림 닫기"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
