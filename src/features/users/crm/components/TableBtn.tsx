import type { PropsWithChildren } from "react";

type Props = {
  title?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function TableBtn({
  title,
  disabled,
  className,
  onClick,
  children,
}: PropsWithChildren<Props>) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`px-3 py-1 rounded-md border disabled:opacity-50 ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
}
