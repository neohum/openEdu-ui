import React from "react";
import "./thin-black.css";

export interface ThinCoordinatePlaneProps {
  size?: number;
  gridSteps?: number;
  showTicks?: boolean;
  className?: string;
}

export function ThinCoordinatePlane({
  size = 160,
  gridSteps = 4, // -4 to +4
  showTicks = true,
  className = "",
}: ThinCoordinatePlaneProps) {
  const center = size / 2;
  const stepSize = center / gridSteps;

  return (
    <div className={["oe-thin-coordinate-plane", className].filter(Boolean).join(" ")}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="oe-thin-plane-svg"
      >
        {/* Grid lines */}
        {Array.from({ length: gridSteps * 2 + 1 }).map((_, i) => {
          const pos = i * stepSize;
          return (
            <React.Fragment key={`grid-${i}`}>
              <line
                x1={pos}
                y1={0}
                x2={pos}
                y2={size}
                stroke="#000000"
                strokeWidth="0.4"
                strokeDasharray="2,2"
              />
              <line
                x1={0}
                y1={pos}
                x2={size}
                y2={pos}
                stroke="#000000"
                strokeWidth="0.4"
                strokeDasharray="2,2"
              />
            </React.Fragment>
          );
        })}

        {/* X and Y axes */}
        <line
          x1={0}
          y1={center}
          x2={size}
          y2={center}
          stroke="#000000"
          strokeWidth="1"
        />
        <line
          x1={center}
          y1={0}
          x2={center}
          y2={size}
          stroke="#000000"
          strokeWidth="1"
        />

        {/* Arrowheads */}
        <polygon
          points={`${size},${center} ${size - 4},${center - 2.5} ${size - 4},${center + 2.5}`}
          fill="#000000"
        />
        <polygon
          points={`${center},0 ${center - 2.5},4 ${center + 2.5},4`}
          fill="#000000"
        />

        {/* Labels: x, y, O */}
        <text
          x={size - 8}
          y={center + 10}
          fontSize="9"
          fontStyle="italic"
          fontFamily="serif"
        >
          x
        </text>
        <text
          x={center - 10}
          y={10}
          fontSize="9"
          fontStyle="italic"
          fontFamily="serif"
        >
          y
        </text>
        <text
          x={center - 8}
          y={center + 10}
          fontSize="8"
          fontStyle="italic"
          fontFamily="serif"
        >
          O
        </text>
      </svg>
    </div>
  );
}
