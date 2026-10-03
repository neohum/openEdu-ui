import React, { useEffect, useState } from "react";
import "./notifications.css";

export interface PopupOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger" | "success";
}

interface ActivePopup extends PopupOptions {
  id: string;
  type: "alert" | "confirm" | "sheet";
  resolve: (value: boolean | string | null) => void;
}

type PopupSubscriber = (popup: ActivePopup | null) => void;
let activePopupSubscriber: PopupSubscriber | null = null;

export const popup = {
  alert: (message: string, title?: string): Promise<void> => {
    return new Promise((resolve) => {
      activePopupSubscriber?.({
        id: Math.random().toString(36).substring(2, 9),
        type: "alert",
        message,
        title,
        confirmText: "확인",
        resolve: () => resolve(),
      });
    });
  },
  confirm: (message: string, options?: Omit<PopupOptions, "message">): Promise<boolean> => {
    return new Promise((resolve) => {
      activePopupSubscriber?.({
        id: Math.random().toString(36).substring(2, 9),
        type: "confirm",
        message,
        title: options?.title,
        confirmText: options?.confirmText || "확인",
        cancelText: options?.cancelText || "취소",
        tone: options?.tone || "default",
        resolve: (val) => resolve(Boolean(val)),
      });
    });
  },
  sheet: (message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      activePopupSubscriber?.({
        id: Math.random().toString(36).substring(2, 9),
        type: "sheet",
        message,
        title,
        confirmText: "닫기",
        resolve: () => resolve(true),
      });
    });
  },
};

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ActivePopup | null>(null);

  useEffect(() => {
    activePopupSubscriber = (p) => setCurrent(p);
    return () => {
      activePopupSubscriber = null;
    };
  }, []);

  const handleClose = (result: boolean | string | null) => {
    current?.resolve(result);
    setCurrent(null);
  };

  return (
    <>
      {children}
      {current && (
        <div
          className="oe-popup-scrim"
          role="presentation"
          onClick={() => handleClose(false)}
        >
          <div
            className={[
              "oe-popup-modal",
              `oe-popup--${current.type}`,
              "oe-glass",
              "oe-glass--frosted",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label={current.title || "알림"}
            onClick={(e) => e.stopPropagation()}
          >
            {current.title && <h3 className="oe-popup-title">{current.title}</h3>}
            <p className="oe-popup-message">{current.message}</p>
            <div className="oe-popup-actions">
              {current.type === "confirm" && (
                <button
                  type="button"
                  className="oe-popup-btn oe-popup-btn--cancel"
                  onClick={() => handleClose(false)}
                >
                  {current.cancelText || "취소"}
                </button>
              )}
              <button
                type="button"
                className={[
                  "oe-popup-btn",
                  `oe-popup-btn--${current.tone || "primary"}`,
                ].join(" ")}
                onClick={() => handleClose(true)}
              >
                {current.confirmText || "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
