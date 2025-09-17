import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SignInForm from "../components/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-950 min-h-screen px-4 my-16 md:my-24">
      <motion.main
        dir="rtl"
        className="w-full max-w-md p-6 rounded-xl bg-white dark:bg-gray-900 shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        <h1 className="text-xl font-semibold mb-4 text-center">כניסה</h1>
        <SignInForm />
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          משתמש חדש?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            לחץ כאן להרשמה
          </Link>
        </p>
        <div className="hidden text-sm text-center mt-2">
          <Link
            to="/forgot-password"
            className="text-accent-600 hover:underline"
          >
            שכחת סיסמה?
          </Link>
        </div>
      </motion.main>
    </div>
  );
}
