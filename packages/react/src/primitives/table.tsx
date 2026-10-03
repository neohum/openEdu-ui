import React, {
  forwardRef,
  type TableHTMLAttributes,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import "./table.css";

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div className="oe-table-wrapper">
      <table ref={ref} className={["oe-table", className].filter(Boolean).join(" ")} {...props}>
        {children}
      </table>
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => (
  <thead ref={ref} className={["oe-table-header", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </thead>
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => (
  <tbody ref={ref} className={["oe-table-body", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </tbody>
));
TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => (
  <tfoot ref={ref} className={["oe-table-footer", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </tfoot>
));
TableFooter.displayName = "TableFooter";

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "", children, ...props }, ref) => (
    <tr ref={ref} className={["oe-table-row", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </tr>
  )
);
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className = "", children, ...props }, ref) => (
  <th ref={ref} className={["oe-table-head", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </th>
));
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className = "", children, ...props }, ref) => (
  <td ref={ref} className={["oe-table-cell", className].filter(Boolean).join(" ")} {...props}>
    {children}
  </td>
));
TableCell.displayName = "TableCell";

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className = "", children, ...props }, ref) => (
  <caption
    ref={ref}
    className={["oe-table-caption", className].filter(Boolean).join(" ")}
    {...props}
  >
    {children}
  </caption>
));
TableCaption.displayName = "TableCaption";
