import React, { createContext, useContext, useState, type HTMLAttributes } from "react";
import "./collapsible.css";

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className = "",
  children,
  ...props
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <CollapsibleContext.Provider value={{ open, toggle }}>
      <div
        className={["oe-collapsible", open ? "oe-collapsible--open" : "", className]
          .filter(Boolean)
          .join(" ")}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export interface CollapsibleTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function CollapsibleTrigger({
  className = "",
  children,
  ...props
}: CollapsibleTriggerProps) {
  const ctx = useContext(CollapsibleContext);

  return (
    <button
      type="button"
      className={["oe-collapsible-trigger", className].filter(Boolean).join(" ")}
      onClick={ctx?.toggle}
      aria-expanded={ctx?.open}
      {...props}
    >
      {children}
    </button>
  );
}

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CollapsibleContent({
  className = "",
  children,
  ...props
}: CollapsibleContentProps) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={["oe-collapsible-content", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
