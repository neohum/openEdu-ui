import React, { forwardRef, type HTMLAttributes } from "react";
import "./mobile.css";

export interface AppScreenProps extends HTMLAttributes<HTMLDivElement> {
  appBar?: React.ReactNode;
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
}

export const AppScreen = forwardRef<HTMLDivElement, AppScreenProps>(
  ({ appBar, bottomNav, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["oe-app-screen", className].filter(Boolean).join(" ")}
        {...props}
      >
        {appBar}
        <div className="oe-app-screen__body">{children}</div>
        {bottomNav}
      </div>
    );
  }
);
AppScreen.displayName = "AppScreen";
