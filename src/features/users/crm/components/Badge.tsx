import type { ReactNode } from "react";

type Props = {
  on: boolean;
  yes: ReactNode;
  no: ReactNode;
  yesCls: string;
  noCls: string;
  className?: string;
};

export default function Badge({
  on,
  yes,
  no,
  yesCls,
  noCls,
  className,
}: Props) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs border ${
        on ? yesCls : noCls
      } ${className ?? ""}`}
    >
      {on ? yes : no}
    </span>
  );
}
