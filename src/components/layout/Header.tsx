import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Search, LogIn, LogOut, Menu, X, User } from "lucide-react";
import LinkButton from "../common/LinkButton";
import { linksFor } from "@/config/navLinks";
import { useAuth } from "@/features/users/auth/useAuth";
import Button from "../common/Button";
import Brand from "../common/Brand";
import { useLocation } from "react-router-dom";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import SearchBox from "./SearchBox";
const Header = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [showSearch, setShowSearch] = useState(false);
  const { role, isGuest, logout } = useAuth();
  const navItems = linksFor(role);
  const headerNav = navItems.filter(
    (i) => i.to !== "/login" && i.to !== "/register"
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowSearch(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  useOnClickOutside(menuRef, () => setOpen(false));
  return (
    <header
      className="
        fixed inset-x-0 top-0 z-50 w-full
        bg-gradient-to-b from-white to-muted-50
        dark:from-muted-900 dark:to-muted-800/60
        backdrop-blur-md border-b border-muted-100 dark:border-muted-800
        shadow-soft py-2
      "
    >
      <div className="container mx-auto px-3 md:px-6">
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 lg:gap-6 py-2.5 md:py-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center font-bold text-lg md:text-xl tracking-tight text-muted-900 dark:text-white">
              <Brand className="w-20" />
              <span className="p-3 font-satisfy text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CardForge
              </span>
            </span>
          </div>
          <nav className="hidden xl:flex justify-center items-center gap-4 flex-wrap">
            {[...headerNav, { to: "/contact", label: "צור קשר" }]
              .slice()
              .reverse()
              .map((item) => {
                return (
                  <LinkButton key={item.to} to={item.to} variant="nav">
                    <span>{item.label}</span>
                  </LinkButton>
                );
              })}
          </nav>

          <div className="flex justify-end items-center gap-2 md:gap-3">
            <div className="relative" ref={searchRef}>
              <Button
                variant="soft"
                size="sm"
                onClick={() => setShowSearch((v) => !v)}
                className="h-10 w-10 p-0 rounded-full"
                aria-label="חיפוש"
                title="חיפוש"
              >
                <Search className="w-5 h-5" />
              </Button>
              {showSearch && (
                <div className="absolute right-0 top-full mt-2">
                  <SearchBox onClose={() => setShowSearch(false)} />
                </div>
              )}
            </div>
            <div className="hidden xl:block">
              {isGuest ? (
                <LinkButton to="/login" variant="soft" className="h-10 px-4">
                  <LogIn className="w-5 h-5" />
                  <span className="ml-2">התחברות / הרשמה</span>
                </LinkButton>
              ) : (
                <Button onClick={logout} variant="soft" className="h-10 px-4">
                  <LogOut className="w-5 h-5" />
                  <span className="ml-2">יציאה</span>
                </Button>
              )}
            </div>

            {!isGuest && (
              <LinkButton
                to="/me"
                variant="soft"
                className="h-10 w-10 p-0 rounded-full"
                aria-label="אזור אישי"
                title="אזור אישי"
              >
                <User className="w-5 h-5" />
              </LinkButton>
            )}

            <Button
              variant="soft"
              size="sm"
              onClick={() => setDark(!dark)}
              className="h-10 w-10 p-0 rounded-full"
              aria-label="החלף מצב תצוגה"
              title="מצב תצוגה"
            >
              {dark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="soft"
              size="sm"
              className="xl:hidden h-10 w-10 p-0 rounded-full"
              onClick={() => setOpen((v) => !v)}
              aria-label="תפריט"
              title="תפריט"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="xl:hidden pb-3 flex justify-center">
            <div ref={menuRef} className="w-auto">
              <nav className="flex flex-col gap-1">
                {headerNav.map((item) => (
                  <LinkButton
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </LinkButton>
                ))}
                <LinkButton
                  to="/contact"
                  variant="default"
                  onClick={() => setOpen(false)}
                >
                  צור קשר
                </LinkButton>

                {!isGuest && (
                  <LinkButton to="/me" onClick={() => setOpen(false)}>
                    אזור אישי
                  </LinkButton>
                )}

                {isGuest ? (
                  <LinkButton
                    to="/login"
                    variant="soft"
                    className="h-8 px-3 rounded-full"
                    onClick={() => setOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="ml-2">התחברות / הרשמה</span>
                  </LinkButton>
                ) : (
                  <Button
                    variant="soft"
                    className="h-8 px-3 rounded-full"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="ml-2">יציאה</span>
                  </Button>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
