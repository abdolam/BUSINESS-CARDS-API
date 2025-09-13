import { motion } from "framer-motion";
import clsx from "clsx";

type Props = { className?: string };

export default function CardCreateAnim({ className }: Props) {
  const t = {
    outline: { d: 0.0 },
    avatar: { d: 0.35 },
    title: { d: 0.55 },
    sub: { d: 0.75 },
    line1: { d: 0.95 },
    line2: { d: 1.15 },
    pulse: { d: 1.35 },
  };

  return (
    <motion.svg
      viewBox="0 0 200 130"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("block drop-shadow", className)}
      initial={false}
    >
      <motion.rect
        x="5"
        y="5"
        rx="16"
        ry="16"
        width="190"
        height="120"
        fill="none"
        stroke="currentColor"
        className="text-primary-400 dark:text-primary-500"
        strokeWidth="2.5"
        pathLength={1}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 1] }}
        transition={{
          duration: 0.5,
          delay: t.outline.d,
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <motion.rect
        x="5"
        y="5"
        rx="16"
        ry="16"
        width="190"
        height="120"
        className="fill-primary-50/40 dark:fill-primary-900/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1] }}
        transition={{
          duration: 0.35,
          delay: t.outline.d + 0.15,
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <motion.circle
        cx="45"
        cy="55"
        r="16"
        className="fill-primary-200/70 dark:fill-primary-700/60"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 1], opacity: [0, 1, 1] }}
        transition={{
          duration: 0.35,
          delay: t.avatar.d,
          type: "spring",
          stiffness: 200,
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <motion.rect
        x="75"
        y="42"
        width={90} // fixed width
        height="8"
        rx="4"
        className="fill-primary-500 dark:fill-primary-400"
        style={{ originX: 0 }} // scale from the left
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 1] }}
        transition={{
          duration: 0.35,
          delay: t.title.d,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <motion.rect
        x="75"
        y="58"
        width={70}
        height="6"
        rx="3"
        className="fill-primary-300 dark:fill-primary-500/70"
        style={{ originX: 0 }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 1] }}
        transition={{
          duration: 0.35,
          delay: t.sub.d,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <motion.rect
        x="75"
        y="58"
        width={70}
        height="6"
        rx="3"
        className="fill-primary-300 dark:fill-primary-500/70"
        style={{ originX: 0 }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 1] }}
        transition={{
          duration: 0.35,
          delay: t.sub.d,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <motion.rect
        x="20"
        y="98"
        width={120}
        height="6"
        rx="3"
        className="fill-muted-300 dark:fill-muted-600"
        style={{ originX: 0 }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 1] }}
        transition={{
          duration: 0.35,
          delay: t.line2.d,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
      <motion.circle
        cx="175"
        cy="25"
        r="5"
        className="fill-primary-500"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1, 0], opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 0.5,
          delay: t.pulse.d,
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      />
    </motion.svg>
  );
}
