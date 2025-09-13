import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { title?: string };

const Logo: React.FC<Props> = ({ title, ...props }) => (
  <svg
    viewBox="0 0 128 128"
    xmlns="http://www.w3.org/2000/svg"
    role={title ? "img" : "presentation"}
    aria-hidden={title ? undefined : true}
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
    {...props}
  >
    {title ? <title>{title}</title> : null}

    <defs>
      {/* Background gradient for the circular fill */}
      <linearGradient id="logo-grad-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E0F2FE" />
        <stop offset="1" stopColor="#F3E8FF" />
      </linearGradient>

      <linearGradient
        id="logo-grad-1"
        x1="30.4805"
        y1="976.8782"
        x2="102.4805"
        y2="1048.8782"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(1 0 0 1 0 -950)"
      >
        <stop offset="0" stopColor="#2563EB" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>

      <linearGradient
        id="logo-grad-2"
        x1="48.185"
        y1="994.335"
        x2="88.278"
        y2="1034.428"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(1 0 0 1 0 -950)"
      >
        <stop offset="0" stopColor="#2563EB" />
        <stop offset="1" stopColor="#9333EA" />
      </linearGradient>

      {/* Clip everything to a perfect circle */}
      <clipPath id="logo-clip">
        <circle cx="64" cy="64" r="56" />
      </clipPath>
    </defs>

    {/* Subtle circular background so the icon is truly circular */}
    <circle cx={64} cy={64} r={56} fill="url(#logo-grad-fill)" />

    {/* Outer ring (outside of clip so it remains crisp) */}
    <circle
      cx={64}
      cy={64}
      r={54}
      fill="none"
      stroke="#0EA5E9"
      strokeWidth={6}
      strokeOpacity={0.08}
      vectorEffect="non-scaling-stroke"
    />

    {/* Inner drawing clipped to circle */}
    <g clipPath="url(#logo-clip)">
      <path
        d="M95.1,42.2c-8-10-22-14-36-12c-18,3-30,18-28,36s18,32,36,32c13,0,23-6,30-14"
        fill="none"
        stroke="url(#logo-grad-1)"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M61.9,49.8v32.9 M61.9,49.8h16.4 M61.9,65.3h13.7"
        fill="none"
        stroke="url(#logo-grad-2)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  </svg>
);

export default Logo;
