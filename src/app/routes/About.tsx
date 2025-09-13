import React from "react";
import UiLink from "@/components/ui/UiLink";

const About = () => {
  return (
    <main className="container mx-auto px-4 py-8" dir="rtl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">אודות</h1>
        <p className="text-muted-600 dark:text-muted-300 mt-2">
          האתר מאפשר יצירה, ניהול וחיפוש של כרטיסי עסק בצורה מהירה, נגישה
          ובטוחה.
        </p>
      </header>

      <section className="space-y-6 text-[0.95rem] leading-7">
        <div>
          <h2 className="text-xl font-semibold mb-2">מה ניתן לעשות כאן?</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>
              <span className="font-medium">דפדוף וחיפוש:</span> צפייה בכרטיסי
              עסק, סינון לפי טקסט חופשי, וכניסה לעמוד פרטים מלא.
            </li>
            <li>
              <span className="font-medium">מועדפים:</span> סימון כרטיסים שאהבת
              והצגתם בעמוד “המועדפים שלי”.
            </li>
            <li>
              <span className="font-medium">יצירה ועריכה:</span> משתמשים עסקיים
              והאדמין יכולים ליצור, לערוך ולמחוק כרטיסים.
            </li>
            <li>
              <span className="font-medium">עמוד פרטי העסק:</span> מציג תמונה,
              תיאור, פרטי קשר, כתובת, מפה דינמית וקיצורי דרך לניווט (Google Maps
              / Waze) ולחיוג מהיר.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">איך מתחילים?</h2>
          <ol className="list-decimal pr-5 space-y-1">
            <li>
              <span className="font-medium">הרשמה/כניסה:</span> פתח חשבון או
              היכנס עם חשבון קיים. לאחר כניסה ניתן לגשת לעמודי “המועדפים שלי”
              ו—לפי הרשאות—גם ל“צור כרטיס”, “הכרטיסים שלי” ו־“CRM”.
            </li>
            <li>
              <span className="font-medium">יצירת כרטיס חדש:</span> בעמוד{" "}
              <UiLink to="/create-card" className="underline">
                “צור כרטיס”
              </UiLink>{" "}
              מלא את כל שדות הטופס (כותרת, תיאור, טלפון, דוא״ל, אתר, ותמונת
              פרופיל). כתובת העסק משמשת גם להצגת מפה וקישורי ניווט.
            </li>
            <li>
              <span className="font-medium">עריכה ומחיקה:</span> ניתן לערוך או
              למחוק כרטיסים מתוך{" "}
              <UiLink to="/my-cards" className="underline">
                “הכרטיסים שלי”
              </UiLink>{" "}
              או מעמוד המועדפים, בהתאם להרשאות. לאחר מחיקה מתבצע ניתוב חזרה
              לעמוד מתאים (הכרטיסים שלי / דף הבית).
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">טפסים, אימות ונגישות</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>
              <span className="font-medium">אחידות בטפסים:</span> כל הטפסים
              משתמשים באותם רכיבי עיצוב, הודעות שגיאה ואימותים (Regex) כדי לשמור
              על חוויה עקבית.
            </li>
            <li>
              <span className="font-medium">
                אימות אנושי (Human Verification):
              </span>{" "}
              משולב בתהליכים רלוונטיים כדי למנוע שימוש זדוני ולשמור על אבטחה.
            </li>
            <li>
              <span className="font-medium">נגישות:</span> תמיכה בניווט מקלדת,
              כפתורי פעולה ברורים, קונטרסט מתאים והעדפת “צמצום תנועה”.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">הרשאות ותפקידים</h2>
          <p>
            המערכת תומכת בתפקידי משתמש שונים (אורח, משתמש, עסק, מנהל). הרשאות
            ליצירה/עריכה/מחיקה של כרטיסים וממשקי ניהול זמינות רק לתפקידים
            המתאימים.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">פרטיות ואבטחה</h2>
          <p>
            אנו מכבדים את פרטיות המשתמשים. פרטי קשר נועדו להצגה בכרטיס בלבד,
            וניתן לעדכן או להסירם בכל עת באמצעות פעולות העריכה.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">צרו קשר</h2>
          <p>
            לשאלות, הערות או דיווח על בעיית נגישות, ניתן לפנות דרך{" "}
            <UiLink to="/contact" className="underline">
              טופס יצירת הקשר
            </UiLink>
            .
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;
