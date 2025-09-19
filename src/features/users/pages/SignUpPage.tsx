import { motion } from "framer-motion";
import SignUpForm from "../components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-fit px-4 my-16 md:my-24">
      <motion.main
        dir="rtl"
        className="w-full max-w-3xl px-6 py-10 md:py-14 rounded-xl bg-white dark:bg-gray-900 shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <h1 className="text-xl font-semibold mb-4 text-center">הרשמה</h1>
        <SignUpForm />
      </motion.main>
    </div>
  );
}
