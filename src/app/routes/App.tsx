import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../../features/cards/pages/Home";
import About from "./About";
import NotFound from "./NotFound";
import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import Layout from "../../components/layout/Layout";
import CreateCard from "../../features/cards/pages/CreateCard";
import SignUpPage from "../../features/users/pages/SignUpPage";
import SignInPage from "../../features/users/pages/SignInPage";
import ToastProvider from "@/components/feedback/ToastProvider";
import FavoritesPage from "@/features/cards/pages/FavoritesPage";
import MyCardsPage from "@/features/cards/pages/MyCardsPage";
import AdminPage from "@/features/cards/pages/AdminPage";
import ForgotPasswordPage from "../../features/users/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/users/pages/ResetPasswordPage";
import ErrorPage from "./ErrorPage";
import ForgotPasswordSentPage from "@/features/users/pages/ForgotPasswordSentPage";
import ContactPage from "@/features/contact/pages/ContactPage";
import MessageSentPage from "@/features/contact/pages/MessageSentPage";
import { HumanVerificationProvider } from "@/features/human-verification";
import SearchResultsPage from "@/features/cards/pages/SearchResultsPage";
import CrmPage from "@/features/users/pages/CrmPage";
import useAuth from "@/features/users/auth/useAuth";
import {
  canAccessAdmin,
  canCreateCard,
  canFavoriteCard,
  canSeeCRM,
  canViewMyCards,
  isAuthenticated,
} from "@/features/users/auth/permissions";
import CardDetailsPage from "@/features/cards/pages/CardDetailsPage";
import Accessibility from "./Accessibility";
import PersonalAreaPage from "@/features/users/pages/PersonalAreaPage";
import GlobalHttpErrorBridge from "@/components/system/GlobalHttpErrorBridge";

function Guard({
  allow,
  children,
  redirectTo,
}: {
  allow: boolean;
  children: React.ReactElement;
  redirectTo?: string; // why: better UX for auth-gated routes
}) {
  if (allow) return children;
  if (redirectTo) return <Navigate to={redirectTo} replace />;
  return <NotFound />;
}

function App() {
  const inflight = useIsFetching();

  // keep your one-time splash behavior
  const FIRST_SPLASH_KEY = "splash-shown";
  const [show, setShow] = useState<boolean>(() => {
    return sessionStorage.getItem(FIRST_SPLASH_KEY) !== "1";
  });

  const mountedAt = React.useRef(performance.now());

  useEffect(() => {
    if (!show) return; // only show on first visit
    if (inflight > 0) {
      setShow(true);
      return;
    }
    const MIN_SHOW_MS = 600;
    const elapsed = performance.now() - mountedAt.current;
    const wait = Math.max(0, MIN_SHOW_MS - elapsed);

    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem(FIRST_SPLASH_KEY, "1");
    }, wait + 150);

    return () => clearTimeout(t);
  }, [inflight, show]);

  const { role } = useAuth();
  const guards = useMemo(
    () => ({
      create: canCreateCard(role),
      myCards: canViewMyCards(role),
      favorites: canFavoriteCard(role),
      admin: canAccessAdmin(role),
      crm: canSeeCRM(role),
      anyAuth: isAuthenticated(role),
    }),
    [role]
  );

  return (
    <>
      <LoadingOverlay open={show} />

      <ToastProvider>
        <HumanVerificationProvider
          minDwellMs={2500}
          turnstileSiteKey={
            import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
          }
        >
          <GlobalHttpErrorBridge /> {/* why: centralize 5xx/network handling */}
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/me"
                element={
                  <Guard allow={guards.anyAuth} redirectTo="/login">
                    <PersonalAreaPage />
                  </Guard>
                }
              />

              <Route
                path="/create-card"
                element={
                  <Guard allow={guards.create}>
                    <CreateCard />
                  </Guard>
                }
              />
              <Route path="/register" element={<SignUpPage />} />
              <Route path="/login" element={<SignInPage />} />
              <Route
                path="/favorites"
                element={
                  <Guard allow={guards.favorites}>
                    <FavoritesPage />
                  </Guard>
                }
              />
              <Route
                path="/my-cards"
                element={
                  <Guard allow={guards.myCards} redirectTo="/login">
                    <MyCardsPage />
                  </Guard>
                }
              />
              <Route
                path="/admin"
                element={
                  <Guard allow={guards.admin}>
                    <AdminPage />
                  </Guard>
                }
              />
              <Route
                path="/crm"
                element={
                  <Guard allow={guards.crm}>
                    <CrmPage />
                  </Guard>
                }
              />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/forgot-password/sent"
                element={<ForgotPasswordSentPage />}
              />
              <Route path="/cards/:id" element={<CardDetailsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/contact/sent" element={<MessageSentPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HumanVerificationProvider>
      </ToastProvider>
    </>
  );
}

export default App;
