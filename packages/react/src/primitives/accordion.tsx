import React, { createContext, useContext, useState, type HTMLAttributes } from "react";
import "./accordion.css";

interface AccordionContextValue {
  expanded: string[];
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  children: React.ReactNode;
}

export function Accordion({
  type = "single",
  defaultValue,
  className = "",
  children,
  ...props
}: AccordionProps) {
  const [expanded, setExpanded] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggle = (val: string) => {
    setExpanded((prev) => {
      if (type === "single") {
        return prev.includes(val) ? [] : [val];
      }
      return prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val];
    });
  };

  return (
    <AccordionContext.Provider value={{ expanded, toggle }}>
      <div
        className={["oe-accordion", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

const ItemContext = createContext<{ value: string; isExpanded: boolean } | null>(null);

export function AccordionItem({
  value,
  className = "",
  children,
  ...props
}: AccordionItemProps) {
  const ctx = useContext(AccordionContext);
  const isExpanded = ctx?.expanded.includes(value) ?? false;

  return (
    <ItemContext.Provider value={{ value, isExpanded }}>
      <div
        className={["oe-accordion-item", isExpanded ? "oe-accordion-item--expanded" : "", className]
          .filter(Boolean)
          .join(" ")}
        data-state={isExpanded ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AccordionTrigger({
  className = "",
  children,
  ...props
}: AccordionTriggerProps) {
  const itemCtx = useContext(ItemContext);
  const accCtx = useContext(AccordionContext);

  return (
    <button
      type="button"
      className={["oe-accordion-trigger", className].filter(Boolean).join(" ")}
      onClick={() => itemCtx && accCtx?.toggle(itemCtx.value)}
      aria-expanded={itemCtx?.isExpanded}
      {...props}
    >
      <span className="oe-accordion-trigger__text">{children}</span>
      <span className="oe-accordion-trigger__icon" aria-hidden="true">
        ▼
      </span>
    </button>
  );
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AccordionContent({
  className = "",
  children,
  ...props
}: AccordionContentProps) {
  const itemCtx = useContext(ItemContext);
  if (!itemCtx?.isExpanded) return null;

  return (
    <div
      className={["oe-accordion-content", className].filter(Boolean).join(" ")}
      role="region"
      {...props}
    >
      {children}
    </div>
  );
}
