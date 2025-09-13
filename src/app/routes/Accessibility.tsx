import React from "react";

const Accessibility = () => {
  return (
    <main className="container mx-auto px-4 py-10" dir="rtl">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        הצהרת נגישות
      </h1>
      <p className="text-slate-700 dark:text-slate-300 mb-8">
        אנו רואים חשיבות רבה בהנגשת האתר לכלל המשתמשים, ובפרט לאנשים עם מוגבלות.
        מטרתנו לספק חוויית שימוש עקבית, ידידותית ומכבדת לכל הגולשים.
      </p>

      {/* Actions done */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          פעולות שבוצעו לשיפור הנגישות
        </h2>
        <ul className="list-disc pr-6 space-y-1 text-slate-700 dark:text-slate-300">
          <li>תמיכה מלאה בניווט מקלדת בכל רכיבי הממשק.</li>
          <li>תיאורי טקסט (alt) לתמונות ותוויות שדות ברורות בטפסים.</li>
          <li>ניגודיות צבעים בהתאם להנחיות WCAG 2.1.</li>
          <li>
            התאמת רכיבי טופס, הודעות שגיאה ותפקידים (roles) לסייעני נגישות.
          </li>
          <li>
            אפשרות לצמצום אנימציות בהתאם להעדפת המשתמש (prefers-reduced-motion).
          </li>
        </ul>
      </section>

      {/* Ongoing */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          המשך שיפור והתאמה
        </h2>
        <p className="text-slate-700 dark:text-slate-300">
          אנו ממשיכים לפעול באופן שוטף לשיפור הנגישות באתר. ייתכן שחלק מהעמודים
          או הרכיבים עדיין אינם מונגשים במלואם, ואנו עובדים לטייב אותם בהדרגה.
        </p>
      </section>

      {/* Contact */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          יצירת קשר בנושא נגישות
        </h2>
        <p className="text-slate-700 dark:text-slate-300">
          אם נתקלתם בליקוי נגישות, קושי בגלישה או יש לכם הצעה לשיפור — נשמח
          לשמוע. ניתן לפנות דרך{" "}
          <a
            className="underline decoration-2 hover:text-primary-600 dark:hover:text-primary-300"
            href="/contact"
          >
            טופס יצירת קשר
          </a>{" "}
          או בדוא״ל:{" "}
          <a
            className="underline decoration-2 hover:text-primary-600 dark:hover:text-primary-300"
            href="mailto:accessibility@example.com"
          >
            accessibility@example.com
          </a>
          .
        </p>
      </section>

      {/* Officer */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          פרטי אחראי נגישות
        </h2>
        <div className="text-slate-700 dark:text-slate-300">
          שם: מנהל/ת הנגישות
          <br />
          טלפון:{" "}
          <a className="underline" href="tel:050-0000000">
            050-0000000
          </a>
          <br />
          דוא״ל:{" "}
          <a className="underline" href="mailto:accessibility@example.com">
            accessibility@example.com
          </a>
        </div>
      </section>
    </main>
  );
};

export default Accessibility;
