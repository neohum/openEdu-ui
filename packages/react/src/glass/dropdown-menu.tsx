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

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="oe-dropdown-menu-root">{children}</div>
    </DropdownContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DropdownMenuTrigger({
  className = "",
  children,
  onClick,
  ...props
}: DropdownMenuTriggerProps) {
  const ctx = useContext(DropdownContext);

  return (
    <button
      ref={ctx?.triggerRef}
      type="button"
      className={["oe-dropdown-trigger", className].filter(Boolean).join(" ")}
      aria-haspopup="menu"
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

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right";
  children: React.ReactNode;
}

export function DropdownMenuContent({
  align = "left",
  className = "",
  children,
  ...props
}: DropdownMenuContentProps) {
  const ctx = useContext(DropdownContext);
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
      role="menu"
      className={[
        "oe-dropdown-content",
        `oe-dropdown-content--align-${align}`,
        "oe-glass",
        "oe-glass--morphing",
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

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DropdownMenuItem({
  className = "",
  children,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const ctx = useContext(DropdownContext);

  return (
    <button
      type="button"
      role="menuitem"
      className={["oe-dropdown-item", className].filter(Boolean).join(" ")}
      onClick={(e) => {
        ctx?.setOpen(false);
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="oe-dropdown-separator" role="separator" />;
}
