import React from "react";
import "./thin-black.css";

export interface ThinPaperTelemetryMarkerProps {
  anonSessionId?: string;
  worksheetId?: string;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
}

export function ThinPaperTelemetryMarker({
  anonSessionId = "anon_s_7f8a9b",
  worksheetId = "WS-MATH-4A",
  pageNumber = 1,
  totalPages = 2,
  className = "",
}: ThinPaperTelemetryMarkerProps) {
  return (
    <footer
      className={["oe-thin-paper-telemetry", className].filter(Boolean).join(" ")}
      aria-label="학습지 무기명 식별 및 페이지 정보"
    >
      <div className="oe-thin-telemetry-qr-box">
        {/* Mock micro 2D matrix for offline-to-online telemetry tracking */}
        <div className="oe-thin-qr-mock" aria-hidden="true">
          <span className="oe-thin-qr-cell" />
          <span className="oe-thin-qr-cell--empty" />
          <span className="oe-thin-qr-cell" />
          <span className="oe-thin-qr-cell--empty" />
          <span className="oe-thin-qr-cell" />
          <span className="oe-thin-qr-cell--empty" />
          <span className="oe-thin-qr-cell" />
          <span className="oe-thin-qr-cell" />
          <span className="oe-thin-qr-cell" />
        </div>
        <div>
          <span>무기명 분석 코드: </span>
          <span className="oe-thin-telemetry-code">{anonSessionId}</span>
          <span> | {worksheetId}</span>
        </div>
      </div>

      <div style={{ fontWeight: 600 }}>
        - {pageNumber} / {totalPages} -
      </div>
    </footer>
  );
}
