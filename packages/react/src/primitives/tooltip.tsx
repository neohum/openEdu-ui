import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { ReactElement } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactElement }) {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content className="oe-tooltip" sideOffset={8}>{label}</RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
