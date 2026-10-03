import React from "react";
import "./selection.css";

export interface PagerProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pager({
  page,
  totalPages,
  onPageChange,
  className = "",
}: PagerProps) {
  const getPages = () => {
    const items: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push("ellipsis");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) items.push(i);

      if (page < totalPages - 2) items.push("ellipsis");
      items.push(totalPages);
    }
    return items;
  };

  return (
    <div
      role="navigation"
      aria-label="페이지 선택"
      className={["oe-pager", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className="oe-pager__btn oe-pager__btn--prev"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      <div className="oe-pager__numbers">
        {getPages().map((item, idx) => {
          if (item === "ellipsis") {
            return (
              <span key={`ellipsis-${idx}`} className="oe-pager__ellipsis">
                …
              </span>
            );
          }
          const isCurrent = item === page;
          return (
            <button
              key={item}
              type="button"
              className={[
                "oe-pager__chip",
                isCurrent ? "oe-pager__chip--current" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="oe-pager__btn oe-pager__btn--next"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </div>
  );
}
