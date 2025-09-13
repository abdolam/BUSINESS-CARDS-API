import type { CSSProperties, ChangeEvent } from "react";

export function createHoneypotProps(
  onFilled: (filled: boolean) => void,
  name = "website"
) {
  let filled = false;
  return {
    name,
    id: name,
    tabIndex: -1,
    autoComplete: "off",
    "aria-hidden": true as const,
    style: {
      position: "absolute",
      left: "-10000px",
      top: "auto",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    } as CSSProperties,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      filled = !!e.target.value?.trim();
      onFilled(filled);
    },
  };
}
