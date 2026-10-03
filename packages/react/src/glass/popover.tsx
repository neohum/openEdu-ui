import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import "./glass.css";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({
  open: controlledOpen,
  onOpenChange,
  children,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="oe-popover-root">{children}</div>
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function PopoverTrigger({
  className = "",
  children,
  onClick,
  ...props
}: PopoverTriggerProps) {
  const ctx = useContext(PopoverContext);

  return (
    <button
      ref={ctx?.triggerRef}
      type="button"
      className={["oe-popover-trigger", className].filter(Boolean).join(" ")}
      aria-expanded={ctx?.open}
      onClick={(e) => {
        ctx?.setOpen(!ctx.open);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right" | "center";
  children: React.ReactNode;
}

export function PopoverContent({
  align = "left",
  className = "",
  children,
  ...props
}: PopoverContentProps) {
  const ctx = useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ctx?.open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        ctx.triggerRef.current &&
        !ctx.triggerRef.current.contains(e.target as Node)
      ) {
        ctx.setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ctx]);

  if (!ctx?.open) return null;

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={[
        "oe-popover-content",
        `oe-popover-content--align-${align}`,
        "oe-glass",
        "oe-glass--frosted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
