import { useId, type ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function FooterSection({
  title,
  subtitle,
  children,
  className,
}: Props) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={clsx("text-gray-800 dark:text-gray-100", className)}
      dir="rtl"
    >
      <h3 id={id} className="text-sm font-semibold mb-3">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}
