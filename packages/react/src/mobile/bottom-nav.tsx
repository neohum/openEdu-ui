import React, { forwardRef, type HTMLAttributes, type ButtonHTMLAttributes } from "react";
import "./mobile.css";

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  compact?: boolean;
  children: React.ReactNode;
}

export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  ({ compact = false, className = "", children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="하단 내비게이션"
        className={[
          "oe-bottom-nav",
          compact ? "oe-bottom-nav--compact" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <div className="oe-bottom-nav__capsule oe-glass oe-glass--morphing">
          {children}
        </div>
      </nav>
    );
  }
);
BottomNav.displayName = "BottomNav";

export interface BottomNavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

export const BottomNavItem = forwardRef<HTMLButtonElement, BottomNavItemProps>(
  ({ active = false, icon, label, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={active}
        aria-label={label}
        className={[
          "oe-bottom-nav-item",
          active ? "oe-bottom-nav-item--active" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <span className="oe-bottom-nav-item__icon">{icon}</span>
        <span className="oe-bottom-nav-item__label">{label}</span>
      </button>
    );
  }
);
BottomNavItem.displayName = "BottomNavItem";
