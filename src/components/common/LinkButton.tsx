import { Link, useLocation } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import clsx from "clsx";

type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "soft"
  | "nav";

interface Props extends LinkProps {
  variant?: Variant;
  activeClassName?: string;
}

const base =
  "inline-flex items-center justify-center rounded-full text-base transition-colors " +
  "focus:outline-none focus:ring-2 focus:ring-accent-300 dark:focus:ring-accent-800";

const byVariant: Record<Variant, string> = {
  default:
    "px-3 py-1 text-muted-800 dark:text-muted-200 hover:bg-muted-100 dark:hover:bg-muted-800",
  primary:
    "px-4 py-1.5 bg-primary-600 text-white hover:bg-primary-700 shadow-soft active:translate-y-px",
  secondary:
    "px-4 py-1.5 bg-muted-100 text-muted-900 hover:bg-muted-200 dark:bg-muted-800 dark:text-white dark:hover:bg-muted-700",
  ghost: "px-3 py-1 bg-transparent hover:bg-muted-100 dark:hover:bg-muted-800",
  outline:
    "px-3 py-1 border border-muted-300 text-muted-800 hover:bg-muted-100 " +
    "dark:border-muted-700 dark:text-white dark:hover:bg-muted-800",
  soft:
    "border border-primary-300 text-primary-600 hover:bg-primary-50 " +
    "dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-900",
  nav: "px-2 py-1 text-muted-900 dark:text-muted-100 hover:text-primary-600 dark:hover:text-primary-300",
};
export default function LinkButton({
  to,
  children,
  variant = "default",
  activeClassName = "",
  className,
  ...props
}: Props) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        base,
        byVariant[variant],
        className,
        isActive && activeClassName
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
