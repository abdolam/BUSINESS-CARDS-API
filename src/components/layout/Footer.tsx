import { ContactList, FooterSection, UiLink } from "../ui";
import { linksFor } from "../../config/navLinks";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import { ArrowUp } from "lucide-react";
import { useAuth } from "../../features/users/auth/useAuth";
import Brand from "../common/Brand";
import { Link } from "react-router-dom";

export default function Footer() {
  const { role } = useAuth();
  const year = new Date().getFullYear();
  const roleLinks = linksFor(role);
  return (
    <footer
      dir="rtl"
      className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300"
      aria-labelledby="site-footer-heading"
    >
      <h2 id="site-footer-heading" className="sr-only">
        תחתית האתר
      </h2>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 justify-items-center text-center">
        <div>
          <span className="flex flex-row-reverse items-center gap-2 font-bold text-lg md:text-xl tracking-tight text-muted-900 dark:text-white">
            <Brand className="w-12" />
            <span className="font-satisfy text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CardForge
            </span>
          </span>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            מרכז העסקים שלך
          </p>

          <div className="flex gap-3 mt-4">
            <Link
              to="https://facebook.com/abdullah.marhaj.2025"
              aria-label="Facebook"
              target="blank"
            >
              <SiFacebook size={20} />
            </Link>
            <Link
              to="https://instagram.com"
              aria-label="Instagram"
              target="blank"
            >
              <SiInstagram size={20} />
            </Link>
            <Link to="https://x.com" aria-label="x" target="blank">
              <SiX size={20} />
            </Link>
            <Link
              to="https://www.linkedin.com/in/abdola-marhaj-947a8228a"
              aria-label="LinkedIn"
              target="blank"
            >
              <SiLinkedin size={20} />
            </Link>
          </div>
        </div>

        <FooterSection title="ניווט מהיר">
          <ul className="space-y-2">
            {roleLinks.map((item) => (
              <li key={item.to}>
                <UiLink to={item.to}>{item.label}</UiLink>
              </li>
            ))}
          </ul>
        </FooterSection>

        <FooterSection title="מידע ועזרה">
          <ul className="space-y-2">
            <li>
              <UiLink to="/about">על האתר</UiLink>
            </li>
            <li>
              <UiLink to="/accessibility">הצהרת נגישות</UiLink>
            </li>
            <li>
              <UiLink to="/contact">צור קשר</UiLink>
            </li>
          </ul>
        </FooterSection>

        <FooterSection title="יצירת קשר">
          <ContactList
            email="abdola.marhaj@gmail.com"
            phone="054-6421214"
            address="אלמרג' 38, ע'ג'ר, 1244000"
          />
          <div className="mt-4">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-xs border px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowUp className="h-4 w-4" />
              לראש הדף
            </button>
          </div>
        </FooterSection>
      </div>

      <div
        dir="ltr"
        className=" border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-500 dark:text-gray-400"
      >
        © {year} CardForge. כל הזכויות שמורות.
      </div>
    </footer>
  );
}
