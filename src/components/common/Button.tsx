import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "soft";
type Size = "xs" | "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof byVariant;
  size?: keyof typeof bySize;
};

const base =
  "inline-flex items-center justify-center font-medium rounded-full transition " +
  "focus:outline-none focus:ring-2 focus:ring-accent-300 dark:focus:ring-accent-800 active:scale-95";

const byVariant: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-soft",
  secondary:
    "bg-muted-100 text-muted-900 hover:bg-muted-200 dark:bg-muted-800 dark:text-white dark:hover:bg-muted-700",
  ghost:
    "bg-transparent text-primary-300 hover:text-primary-600" +
    " dark:text-muted-400 dark:hover:text-muted-300",
  outline:
    "border border-muted-300 text-muted-800 hover:bg-muted-100 " +
    "dark:border-muted-700 dark:text-white dark:hover:bg-muted-800",

  soft:
    "border border-primary-300 text-primary-600 hover:bg-primary-50 " +
    "dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-900",
};

const bySize: Record<Size, string> = {
  xs: "px-3 py-1 text-xs",
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2",
  lg: "px-5 py-3 text-lg",
};

export default function Button({
  variant = "soft",
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(base, byVariant[variant], bySize[size], className)}
      {...props}
    />
  );
}

export function SearchBoxIcon({
  variant = "ghost",
  size = "xs",
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(base, byVariant[variant], bySize[size], className)}
      {...props}
    />
  );
}

export function FormButton({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={clsx(
        base,
        byVariant[variant],
        bySize[size],
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        className
      )}
    />
  );
}
