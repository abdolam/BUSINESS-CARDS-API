import Button from "@/components/common/Button";
import Main from "@/components/layout/Main";
import { useLocation, useNavigate } from "react-router-dom";

export default function ForgotPasswordSentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  return (
    <Main>
      <div
        className="max-w-md mx-auto pt-10 pb-24 md:mt-20 space-y-4 text-center overflow-x-hidden"
        dir="rtl"
        aria-label="קישור איפוס נשלח"
      >
        <h1 className="text-2xl font-semibold mb-2">בדקו את תיבת הדוא״ל</h1>

        <p className="text-sm opacity-80 mb-6 break-words">
          אם האימייל {email ? <strong dir="ltr">{email}</strong> : "שסיפקתם"}{" "}
          קיים במערכת, שלחנו קישור לאיפוס סיסמה. הקישור תקף לזמן מוגבל.
        </p>

        <div className="flex justify-center gap-2 pt-2">
          <Button
            type="button"
            className="h-10 px-6 rounded-full"
            onClick={() => navigate("/login")}
          >
            חזרה למסך כניסה
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="h-10 px-6 rounded-full"
            onClick={() => navigate("/forgot-password")}
          >
            להחלפת אימייל
          </Button>
        </div>
      </div>
    </Main>
  );
}
