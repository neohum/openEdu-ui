import {
  createContext,
  useContext,
  useId,
  useState,
  useRef,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from "react";

type TabsContextType = {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return ctx;
}

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
};

export function Tabs({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  className,
  id: customId,
  ...rest
}: TabsProps) {
  const generatedId = useId();
  const baseId = customId || generatedId;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const setValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue, baseId }}>
      <div
        {...rest}
        id={baseId}
        className={["oe-tabs", className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function TabsList({ children, className, ...rest }: TabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!listRef.current) return;
    const tabs = Array.from(
      listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')
    );
    if (!tabs.length) return;

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
    }

    rest.onKeyDown?.(e);
  };

  return (
    <div
      {...rest}
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={["oe-tabs-list", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

export type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  children: ReactNode;
};

export function TabsTrigger({
  value,
  children,
  disabled,
  className,
  ...rest
}: TabsTriggerProps) {
  const { value: selectedValue, setValue, baseId } = useTabsContext();
  const isSelected = selectedValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      {...rest}
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      data-state={isSelected ? "active" : "inactive"}
      onClick={(e) => {
        setValue(value);
        rest.onClick?.(e);
      }}
      className={["oe-tabs-trigger", className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}

export type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  children: ReactNode;
};

export function TabsContent({
  value,
  children,
  className,
  ...rest
}: TabsContentProps) {
  const { value: selectedValue, baseId } = useTabsContext();
  const isSelected = selectedValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <div
      {...rest}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={!isSelected}
      tabIndex={0}
      data-state={isSelected ? "active" : "inactive"}
      className={["oe-tabs-content", className].filter(Boolean).join(" ")}
    >
      {isSelected ? children : null}
    </div>
  );
}
