import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import type { ReactNode } from "react";
import SkipLink from "./SkipLink";
import AccessibilityMenu from "../../features/a11y/components/AccessibilityMenu";
import GlobalHttpErrorBridge from "@/components/system/GlobalHttpErrorBridge";
import { useLayoutEffect, useRef } from "react"; // ← add

const Layout = ({ children }: { children: ReactNode }) => {
  const headerWrapRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = headerWrapRef.current;
    if (!el) return;

    const apply = () => {
      const h = el.offsetHeight || 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };

    apply();

    // Keep it in sync if header height changes (responsive, fonts, etc.)
    const ro = new ResizeObserver(apply);
    ro.observe(el);

    // Also re-apply on orientation/viewport changes
    window.addEventListener("resize", apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black dark:bg-muted-900 dark:text-white transition-colors duration-300">
      <SkipLink />

      {/* Sticky wrapper that we measure */}
      <div ref={headerWrapRef} className="sticky top-0 z-50">
        <Header />
      </div>

      <GlobalHttpErrorBridge />

      <Main id="main" tabIndex={-1} className="flex-1">
        {children}
      </Main>

      <Footer />
      <AccessibilityMenu />
    </div>
  );
};

export default Layout;
