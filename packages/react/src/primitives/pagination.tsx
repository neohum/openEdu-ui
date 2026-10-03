import React, { forwardRef, type HTMLAttributes, type AnchorHTMLAttributes } from "react";
import "./pagination.css";

export const Pagination = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className = "", children, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="페이지 내비게이션"
      className={["oe-pagination", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </nav>
  )
);
Pagination.displayName = "Pagination";

export const PaginationContent = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  ({ className = "", children, ...props }, ref) => (
    <ul
      ref={ref}
      className={["oe-pagination-content", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </ul>
  )
);
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  ({ className = "", children, ...props }, ref) => (
    <li ref={ref} className={["oe-pagination-item", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </li>
  )
);
PaginationItem.displayName = "PaginationItem";

export interface PaginationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
}

export const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ isActive = false, className = "", children, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? "page" : undefined}
      className={[
        "oe-pagination-link",
        isActive ? "oe-pagination-link--active" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </a>
  )
);
PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className = "", children = "이전", ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="이전 페이지로 이동"
      className={["oe-pagination-prev", className].filter(Boolean).join(" ")}
      {...props}
    >
      ‹ {children}
    </PaginationLink>
  )
);
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className = "", children = "다음", ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label="다음 페이지로 이동"
      className={["oe-pagination-next", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children} ›
    </PaginationLink>
  )
);
PaginationNext.displayName = "PaginationNext";

export const PaginationEllipsis = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className = "", ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={["oe-pagination-ellipsis", className].filter(Boolean).join(" ")}
      {...props}
    >
      …
    </span>
  )
);
PaginationEllipsis.displayName = "PaginationEllipsis";
