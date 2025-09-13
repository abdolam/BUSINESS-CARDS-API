import clsx from "clsx";
import type { ComponentType } from "react";

type Props = {
  icon: ComponentType<{ className?: string }>;
  label: string; // aria-label
  href?: string; // if provided -> <a>, else <button>
  onClick?: () => void;
  className?: string;
};

export default function IconCircle({
  icon: Icon,
  label,
  href,
  onClick,
  className,
}: Props) {
  const classes = clsx(
    "rounded-full p-2 border border-gray-300 dark:border-gray-700",
    "hover:bg-gray-100 dark:hover:bg-gray-800",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400",
    className
  );

  const content = <Icon className="h-4 w-4" />;

  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        aria-label={label}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={classes}
    >
      {content}
    </button>
  );
}
