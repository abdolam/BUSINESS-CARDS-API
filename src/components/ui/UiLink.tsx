import { Link, type To } from "react-router-dom";
import clsx from "clsx";
import type { ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

type RouterLinkProps = BaseProps & {
  to: To; // required for router links
  href?: never;
  target?: never;
  rel?: never;
};

type AnchorProps = BaseProps & {
  href: string; // required for anchors
  to?: never;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
};

type Props = RouterLinkProps | AnchorProps;

function isRouterLink(p: Props): p is RouterLinkProps {
  return (p as RouterLinkProps).to !== undefined;
}

const base =
  "hover:text-primary-600 dark:hover:text-primary-300 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400";

export default function UiLink(props: Props) {
  if (isRouterLink(props)) {
    const { to, children, className, ariaLabel } = props;
    return (
      <Link to={to} aria-label={ariaLabel} className={clsx(base, className)}>
        {children}
      </Link>
    );
  }

  const { href, children, className, ariaLabel, target, rel } = props;
  const isExternal = target === "_blank" || /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={clsx(base, className)}
      target={target ?? (isExternal ? "_blank" : undefined)}
      rel={rel ?? (isExternal ? "noopener noreferrer" : undefined)}
    >
      {children}
    </a>
  );
}
