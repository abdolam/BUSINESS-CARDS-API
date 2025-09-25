# Business Cards App — README (EN + HE)

> Single bilingual README. English first, then Hebrew. Keep this file as `README.md` at the project root.

---

## 🇬🇧 English

A responsive SPA (React + TypeScript + Vite) for creating and managing business cards. Includes role‑based access control, admin CRM, optimistic updates, RTL support, a11y tools, and robust error handling.

### ✨ Features

- Browse & search cards with client filtering on top of server data
- Favorites (like/unlike) with **optimistic** updates across caches
- **My Cards**: create, edit, delete (Business/Admin)
- Card Details (+ Google Maps embed when address exists)
- **CRM (Admin)**: users list with pagination, filters, search, totals, CSV export, safe RBAC (no self‑delete, no admin‑to‑admin destructive actions)
- Human Verification (Cloudflare Turnstile) + honeypot & time‑gate strategies
- Global Loading Overlay & first‑visit Splash
- Toast notifications + **Global HTTP error bridge**
- RTL‑friendly UI and accessibility helpers

### 🧱 Tech Stack

React 18 • TypeScript • Vite • TanStack Query • React Router • React Hook Form + Joi • Tailwind CSS • Framer Motion • Axios • Lucide Icons

### 🚀 Getting Started

```bash
npm install
npm run dev
npm run build
npm run preview
```

Open the dev URL printed by Vite (usually http://localhost:5173).

### 🔧 Environment Variables

Create `.env` in the project root with:

```env
VITE_USERS_API_URL=...
VITE_CARDS_API_URL=...
VITE_TURNSTILE_SITE_KEY=...
VITE_FALLBACK_IMAGE_URL=...
```

### 🔐 Auth & Permissions

- JWT is stored in `localStorage` under `token`.
- Axios interceptors add `Authorization: Bearer <token>` and `x-auth-token`.
- On 401/403 the client signs out and updates UI.
- Route Guards: `/create-card`, `/my-cards`, `/favorites` require auth; `/admin` and `/crm` require Admin.
- Card actions: Admin can edit/delete any card; Business can edit/delete **own** cards.

### 🌐 API (example surface)

**Cards**: `GET /cards`, `GET /cards/:id`, `POST /cards`, `PUT /cards/:id`, `DELETE /cards/:id`, `PATCH /cards/:id` (toggle like).

**Users**: `POST /users`, `POST /users/login`, `GET /users`, `GET /users/:id`, `PUT /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`.

### 🗺️ Israel‑Only Address Import

- When country is **Israel/ישראל**, city and street inputs show dropdown lists powered by data.gov.il (cities dataset `5c78e9fa-...`, streets dataset `9ad3862c-...`).
- Client‑side filtering, keyboard navigation, and no visible scrollbars.

### ♿ Accessibility

- Accessibility menu (contrast, reading font, underline links, reduce motion, font scaling)
- A11Y contact form correctly positioned on mobile
- Focus rings, aria roles, and right‑to‑left layout

### ⭐ Optimistic Favorites

- Like/unlike updates all relevant caches (`cards`, `cards-paged`, `my-cards`) immediately; reverts on error.

### 🧩 Known Notes

- Free API hosts may cold‑start; refresh once if initial fetch seems empty.

### 📜 License

MIT © 2025 Abdullah Marhaj

---

## 🇮🇱 עברית

אפליקציית SPA מגיבה (React + TypeScript + Vite) לניהול כרטיסי ביקור. כוללת הרשאות לפי תפקיד, CRM לאדמין, עדכונים אופטימיים, תמיכה מלאה ב‑RTL, כלי נגישות וטיפול שגיאות חזק.

### ✨ יכולות

- עיון וחיפוש בכרטיסים (סינון בצד הלקוח מעל נתוני השרת)
- מועדפים (לייק/הסר לייק) בעדכון **אופטימי**
- **הכרטיסים שלי**: יצירה, עריכה ומחיקה (לעסקי/אדמין)
- דף פרטי כרטיס (+ מפה כאשר קיימת כתובת)
- **CRM (אדמין)**: רשימת משתמשים עם עימוד, מסננים, חיפוש, סיכומים, יצוא CSV והרשאות בטוחות (אי‑אפשר למחוק את עצמך או לבצע פעולות הרסניות על אדמין אחר)
- אימות אנושי (Turnstile) + מלכודת בוטים ושער זמן
- שכבת טעינה גלובלית ומסך פתיחה
- טוסטים + **גשר שגיאות HTTP** גלובלי
- תמיכה ב‑RTL ונגישות

### 🧱 טכנולוגיות

React 18 • TypeScript • Vite • TanStack Query • React Router • RHF + Joi • Tailwind • Framer Motion • Axios • Lucide

### 🚀 התחלה מהירה

```bash
npm install
npm run dev
npm run build
npm run preview
```

### 🔧 משתני סביבה

קובץ `.env` בשורש הפרויקט:

```env
VITE_USERS_API_URL=...
VITE_CARDS_API_URL=...
VITE_TURNSTILE_SITE_KEY=...
VITE_FALLBACK_IMAGE_URL=...
```

### 🔐 אימות והרשאות

- ה‑JWT נשמר תחת `token` ב‑`localStorage`.
- Interceptors מוסיפים `Authorization` ו‑`x-auth-token` לכל בקשה.
- בקבלת 401/403 מתבצעת התנתקות ועדכון הממשק.
- שמירת נתיבים: `/create-card`, `/my-cards`, `/favorites` דורשים התחברות; `/admin` ו‑`/crm` לאדמין בלבד.
- פעולות כרטיסים: אדמין יכול לערוך/למחוק כל כרטיס; משתמש עסקי יכול לערוך/למחוק **כרטיסים בבעלותו**.

### 🌐 API (דוגמה)

**כרטיסים**: `GET /cards`, `GET /cards/:id`, `POST /cards`, `PUT /cards/:id`, `DELETE /cards/:id`, `PATCH /cards/:id` (לייק).

**משתמשים**: `POST /users`, `POST /users/login`, `GET /users`, `GET /users/:id`, `PUT /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`.

### 🗺️ יבוא כתובות – ישראל בלבד

- כאשר המדינה היא **Israel/ישראל**, שדות עיר ורחוב מציגים רשימות בחירה מתוך data.gov.il (ערים `5c78e9fa-...`, רחובות `9ad3862c-...`).
- סינון בצד הלקוח, ניווט מקלדת וללא פסי גלילה גלויים.

### ♿ נגישות

- תפריט נגישות (ניגודיות, גופן קריא, הדגשת קישורים, עצירת אנימציות, הגדלת טקסט)
- טופס נגישות ממוקם נכון במובייל
- טבעות פוקוס ותמיכה ב‑RTL

### ⭐ מועדפים אופטימיים

- פעולת לייק מעדכנת מיידית את כל המטמונים הרלוונטיים; חזרה לאחור במקרה כשל.

### 🧩 הערות

- שרתי Demo חינמיים עלולים להתעורר באיטיות; נסו רענון במקרה הצורך.

### 📜 רישיון

MIT © 2025 Abdullah Marhaj
