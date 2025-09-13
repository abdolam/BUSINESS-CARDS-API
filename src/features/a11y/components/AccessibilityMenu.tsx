import { useEffect, useId, useRef, useState } from "react";
import {
  Accessibility as AccessibilityIcon,
  Eye,
  Type,
  Link2,
  Zap,
  Plus,
  Minus,
  RefreshCw,
  MessageCircleMore,
  X,
} from "lucide-react";
import { useA11y } from "../hooks/useA11y";
import A11yContactForm from "./A11yContactForm";

type BtnProps = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  ariaLabel?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
};

function A11yButton({
  active,
  onClick,
  icon,
  label,
  ariaLabel,
  buttonRef,
}: BtnProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel ?? label}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 text-xs font-medium
        transition-colors duration-200
        ${
          active
            ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/40"
            : "border-gray-300 text-gray-800 bg-white dark:bg-gray-900 dark:text-gray-100"
        }
        hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
    >
      <span className="w-6 h-6" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function AccessibilityMenu() {
  const panelId = useId();
  const {
    state,
    toggle,
    setContrast,
    stepFontScale,
    resetFontScale,
    resetAll,
  } = useA11y();

  const [open, setOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const contactBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!showFeedback) {
      contactBtnRef.current?.focus();
    }
  }, [showFeedback]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "סגירת תפריט נגישות" : "פתיחת תפריט נגישות"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((s) => !s)}
        className="fixed left-4 bottom-4 z-[1000] h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl
                   ring-2 ring-white/40 ring-offset-2 ring-offset-blue-600
                   hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                   flex items-center justify-center"
      >
        <span
          aria-hidden="true"
          className="[text-shadow:0_1px_0_rgba(0,0,0,0.25)]"
        >
          <AccessibilityIcon size={28} strokeWidth={3} className="shrink-0" />
        </span>
      </button>
      <aside
        id={panelId}
        role="region"
        aria-label="בקרות נגישות"
        dir="rtl"
        className={`fixed right-0 top-0 z-[999] h-[95vh] my-4 w-[22rem] 
                  bg-white/95 dark:bg-gray-900/95 backdrop-blur
                    border-r border-gray-200 dark:border-gray-700
                    transition-transform duration-300
                    ${open ? "translate-x-0" : "translate-x-full"}
                    flex flex-col
                    `}
      >
        <div className="sticky top-0 z-[1] flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
          <h2 className="text-base font-semibold">תפריט נגישות</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="סגירת התפריט"
          >
            <X size={20} className="shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 p-4">
            <A11yButton
              active={state.underlineLinks}
              onClick={() => toggle("underlineLinks")}
              icon={<Link2 size={20} className="shrink-0" />}
              label="הדגשת קישורים"
            />
            <A11yButton
              active={state.readingFont}
              onClick={() => toggle("readingFont")}
              icon={<Type size={20} className="shrink-0" />}
              label="גופן קריא"
            />
            <A11yButton
              active={state.contrast === "high"}
              onClick={() => setContrast("high")}
              icon={<Eye size={20} className="shrink-0" />}
              label="ניגודיות גבוהה"
            />
            <A11yButton
              active={state.reduceMotion} // לחוץ כשעצירת אנימציות פעילה
              onClick={() => toggle("reduceMotion")}
              icon={<Zap size={20} className="shrink-0" />}
              label={
                state.reduceMotion ? "עצירת אנימציות פעילה" : "עצירת אנימציות"
              }
              ariaLabel="הפעלת או עצירת אנימציות"
            />
            <button
              type="button"
              aria-label="הגדלת טקסט"
              onClick={() => stepFontScale(0.1)}
              className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-medium
                       border-gray-300 hover:shadow-md bg-white dark:bg-gray-900"
            >
              <Plus size={20} className="shrink-0" aria-hidden="true" />
              גדול יותר
            </button>
            <button
              type="button"
              aria-label="הקטנת טקסט"
              onClick={() => stepFontScale(-0.1)}
              className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-medium
                       border-gray-300 hover:shadow-md bg-white dark:bg-gray-900"
            >
              <Minus size={20} className="shrink-0" aria-hidden="true" />
              קטן יותר
            </button>
            <button
              type="button"
              aria-label="איפוס גודל טקסט"
              onClick={resetFontScale}
              className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-medium
                       border-gray-300 hover:shadow-md bg-white dark:bg-gray-900"
            >
              <RefreshCw size={20} className="shrink-0" aria-hidden="true" />
              איפוס גודל טקסט
            </button>
            <A11yButton
              buttonRef={contactBtnRef}
              active={showFeedback}
              onClick={() => setShowFeedback((s) => !s)}
              icon={<MessageCircleMore size={20} className="shrink-0" />}
              label="פנייה ומשוב"
            />

            <A11yButton
              active={false}
              onClick={resetAll}
              icon={<RefreshCw size={20} className="shrink-0" />}
              label="איפוס הכל"
            />
          </div>
        </div>
        <div
          id="a11y-feedback-panel"
          className={`u-collapse absolute top-4 right-full mr-4 z-0 w-fit min-h-fit overflow-y-auto
                      rounded-xl border border-gray-300 dark:border-gray-700
                    bg-white/95 dark:bg-gray-900/95 shadow-2xl p-5
                      transition-all duration-300 will-change-[opacity,transform]
                      motion-reduce:transition-none motion-reduce:transform-none
                    ${
                      showFeedback
                        ? "opacity-100 translate-x-0 pointer-events-auto"
                        : "opacity-0 translate-x-2 pointer-events-none"
                    }
                    `}
          data-open={showFeedback ? "true" : "false"}
        >
          <A11yContactForm onClose={() => setShowFeedback(false)} />
        </div>
      </aside>
    </>
  );
}
