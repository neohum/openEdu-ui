import React, { useState, forwardRef, type HTMLAttributes, type ImgHTMLAttributes } from "react";
import "./avatar.css";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = "md", className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={["oe-avatar", `oe-avatar--${size}`, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ src, alt = "", className = "", onLoadingStatusChange, ...props }, ref) => {
    const [hasError, setHasError] = useState(!src);

    if (hasError) return null;

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={["oe-avatar__img", className].filter(Boolean).join(" ")}
        onError={() => {
          setHasError(true);
          onLoadingStatusChange?.("error");
        }}
        onLoad={() => onLoadingStatusChange?.("loaded")}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={["oe-avatar__fallback", className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </span>
    );
  }
);
AvatarFallback.displayName = "AvatarFallback";
