import Logo from "@/components/common/logo";

type Mode = "indeterminate" | "determinate";

type Props = {
  size?: number; // px
  ringWidth?: number; // px
  mode?: Mode;
  progress?: number; // 0..1 (used only in determinate)
  ringColorClass?: string; // Tailwind color for active arc
  bgRingColorClass?: string; // Tailwind color for background track
  spinMs?: number; // rotation speed (indeterminate)
  className?: string;
  label?: string;
};

export default function LogoSpinner({
  size = 64,
  ringWidth = 6,
  mode = "indeterminate",
  progress = 0,
  ringColorClass = "text-primary-600 dark:text-primary-400",
  bgRingColorClass = "text-muted-200 dark:text-muted-700",
  spinMs = 1400,
  className,
}: Props) {
  // We render a 100x100 viewBox and scale via CSS to keep math simple.
  const r = 45; // radius
  const center = 50;
  const circumference = 2 * Math.PI * r;

  // Dash for determinate (progress arc length)
  const dashArray =
    mode === "determinate"
      ? `${Math.max(0, Math.min(1, progress)) * circumference} ${circumference}`
      : // For spinner, a fixed arc + gap looks smooth while we rotate the group:
        `${0.75 * r * Math.PI} ${circumference}`;

  return (
    <div
      className={["inline-grid place-items-center", className ?? ""].join(" ")}
    >
      <div
        className="relative inline-grid place-items-center"
        style={{ width: size, height: size }}
      >
        {/* Ring */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0"
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            strokeWidth={ringWidth}
            className={bgRingColorClass}
            stroke="currentColor"
            opacity={0.4}
          />
          {/* Animated arc */}
          <g
            className={mode === "indeterminate" ? "animate-spin" : undefined}
            style={
              mode === "indeterminate"
                ? {
                    transformOrigin: "50% 50%",
                    animationDuration: `${spinMs}ms`,
                  }
                : undefined
            }
          >
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              strokeWidth={ringWidth}
              strokeLinecap="round"
              className={ringColorClass}
              stroke="currentColor"
              strokeDasharray={dashArray}
              // Optionally ease in/out the dash when determinate changes
              style={
                mode === "determinate"
                  ? { transition: "stroke-dasharray 220ms linear" }
                  : undefined
              }
            />
          </g>
        </svg>

        {/* The logo itself (kept intact) */}
        <Logo className="h-[75%] w-[75%] aspect-square" aria-hidden="true" />
      </div>
    </div>
  );
}
