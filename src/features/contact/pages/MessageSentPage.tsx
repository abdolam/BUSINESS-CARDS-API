import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type SentState = { trackingId?: string } | null;

export default function MessageSentPage() {
  const navigate = useNavigate();
  const state = (useLocation().state as SentState) ?? null;
  const trackingId =
    (state && state.trackingId) ||
    `CT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-XXXX`; // fallback if direct visit

  return (
    <div className="flex items-center justify-center min-h-screen px-4 my-16 md:my-24">
      <motion.main
        dir="rtl"
        className="w-full max-w-xl px-6 py-10 md:py-14 rounded-xl bg-white dark:bg-gray-900 shadow-lg text-center space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        aria-label="הודעה נשלחה"
      >
        <img
          src="/logo.svg"
          alt="לוגו האתר"
          className="mx-auto w-20 h-20 rounded-md shadow-sm mb-2"
        />

        <h1 className="text-2xl font-semibold">תודה! ההודעה נשלחה</h1>

        <p className="text-sm text-muted-foreground">
          קיבלנו את פנייתך ומספר המעקב שלך הוא:{" "}
          <strong dir="ltr" className="font-mono">
            {trackingId}
          </strong>
          . נשוב אליך בהקדם.
        </p>

        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            className="u-btn u-btn-submit"
            onClick={() => navigate("/")}
          >
            חזרה לדף הבית
          </button>
          <button
            type="button"
            className="u-btn u-btn-cancel"
            onClick={() => navigate("/contact")}
          >
            שליחת הודעה נוספת
          </button>
        </div>
      </motion.main>
    </div>
  );
}
