import * as RadixDialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { IconButton } from "./button.tsx";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Label for the close button. */
  closeLabel?: string;
  children?: ReactNode;
};

export function Dialog({ open, onOpenChange, title, description, closeLabel = "닫기", children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="oe-dialog__overlay" />
        <RadixDialog.Content className="oe-dialog" {...(description ? {} : { "aria-describedby": undefined })}>
          <header className="oe-dialog__header">
            <RadixDialog.Title className="oe-dialog__title">{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <IconButton icon="cross" label={closeLabel} />
            </RadixDialog.Close>
          </header>
          {description ? (
            <RadixDialog.Description className="oe-dialog__description">{description}</RadixDialog.Description>
          ) : null}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
