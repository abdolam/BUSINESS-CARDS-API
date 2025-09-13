import { motion } from "framer-motion";
import LoadingOverlay from "./LoadingOverlay";

export default function Splash() {
  return (
    <div className="fixed  gap-96 inset-0 z-[9999] grid place-items-center bg-white dark:bg-muted-900">
      <div>
        {/*  */}
        <motion.svg
          viewBox="0 0 200 130"
          className="h-40 w-80 text-primary-500"
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
            strokeWidth="2.5"
            pathLength={1}
            animate={{ pathLength: [0, 1] }}
            transition={{
              type: "tween",
              duration: 0.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.8,
            }}
          />
          <motion.rect
            x="5"
            y="5"
            rx="16"
            ry="16"
            width="190"
            height="120"
            className="fill-primary-50/60 dark:fill-primary-900/30"
            animate={{ opacity: [0, 1] }}
            transition={{
              type: "tween",
              duration: 0.3,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 0.5,
            }}
          />
          <motion.circle
            cx="45"
            cy="55"
            r="16"
            className="fill-primary-300/80 dark:fill-primary-600/70"
            animate={{ scale: [0, 1] }}
            transition={{
              type: "tween",
              duration: 0.25,
              delay: 0.3,
              repeat: Infinity,
              repeatDelay: 0.8,
            }}
          />
          <motion.rect
            x="75"
            y="42"
            width={90} /* fixed numeric width */
            height="8"
            rx="4"
            className="fill-primary-600 dark:fill-primary-400"
            style={{ originX: 0 }} /* scale from the left edge */
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              type: "tween",
              duration: 0.25,
              delay: 0.4,
              repeat: Infinity,
              repeatDelay: 0.8,
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
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              type: "tween",
              duration: 0.25,
              delay: 0.5,
              repeat: Infinity,
              repeatDelay: 0.8,
            }}
          />
        </motion.svg>
      </div>
      <div>
        <LoadingOverlay open />
      </div>
    </div>
  );
}
