import React, { Suspense } from "react";
import LinkButton from "../common/LinkButton";

const CardCreateAnim = React.lazy(
  () => import("../../features/cards/components/CardCreateAnim")
);

interface PromoHeaderProps {
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  showAnimation?: boolean;
  animClassName?: string;
}

export default function PromoHeader({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  showAnimation = false,
  animClassName,
}: PromoHeaderProps) {
  return (
    <section
      dir="rtl"
      className="
        relative overflow-hidden mb-6 md:mb-8 text-center
        rounded-2xl border border-muted-200/70 dark:border-muted-800
        bg-gradient-to-br from-white via-white to-primary-50
        dark:from-muted-900 dark:via-muted-900 dark:to-primary-900/20
        px-4 md:px-8 py-8 md:py-12
      "
    >
      {showAnimation && (
        <div className="flex justify-center mb-4 ">
          <Suspense fallback={null}>
            <CardCreateAnim
              className={animClassName ?? "h-16 w-32 md:h-20 md:w-40"}
            />
          </Suspense>
        </div>
      )}

      <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
        {title}
      </h1>

      {subtitle && (
        <p className="mt-2 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto text-muted-600 dark:text-muted-300">
          {subtitle}
        </p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        {primaryCta && (
          <LinkButton
            to={primaryCta.to}
            variant="primary"
            className="h-11 px-6 text-lg inline-flex items-baseline gap-2"
          >
            <span className="leading-none">{primaryCta.label}</span>
            <span
              aria-hidden="true"
              className="text-2xl font-extrabold leading-none"
            >
              +
            </span>
          </LinkButton>
        )}

        {secondaryCta && (
          <LinkButton
            to={secondaryCta.to}
            variant="outline"
            className="h-11 px-6 text-lg border-primary-400 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-900/30"
          >
            {secondaryCta.label}
          </LinkButton>
        )}
      </div>
    </section>
  );
}
