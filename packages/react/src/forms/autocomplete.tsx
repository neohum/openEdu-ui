import React, { useRef, useState, useEffect } from "react";
import "./forms.css";

export interface AutocompleteOption {
  value: string;
  label: string;
  category?: string;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Autocomplete({
  options,
  value = "",
  onChange,
  placeholder = "검색하여 선택...",
  label,
  error,
  disabled,
  className = "",
}: AutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.value.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (opt: AutocompleteOption) => {
    setQuery(opt.label);
    onChange?.(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightIdx]) {
        handleSelect(filtered[highlightIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={["oe-autocomplete-root", className].filter(Boolean).join(" ")}
    >
      {label && <label className="oe-label">{label}</label>}
      <div className="oe-autocomplete-input-box">
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          className={["oe-input", error ? "oe-input--error" : ""].filter(Boolean).join(" ")}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlightIdx(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <span className="oe-autocomplete-arrow" aria-hidden="true">
          ▾
        </span>
      </div>

      {open && filtered.length > 0 && (
        <ul
          className="oe-autocomplete-list oe-glass oe-glass--frosted"
          role="listbox"
        >
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={i === highlightIdx}
              className={[
                "oe-autocomplete-item",
                i === highlightIdx ? "oe-autocomplete-item--highlighted" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => setHighlightIdx(i)}
              onClick={() => handleSelect(opt)}
            >
              <span>{opt.label}</span>
              {opt.category && (
                <span className="oe-autocomplete-category">{opt.category}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="oe-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
