import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  NameFields,
  ContactFields,
  ImageFields,
  AddressFields,
  ActionsBar,
} from "@/components/forms";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import {
  getMe,
  updateUser,
  deleteUser,
  signOut,
  toggleUserStatus,
} from "@/features/users/services/userService";
import { signUpSchema } from "@/features/users/validators/userSchemas";
import type { SignUpDto, User } from "@/types/user";
import { DEFAULT_IMAGE } from "@/features/users/constants/userDefaults";
import { useNavigate } from "react-router-dom";
import PersonalAreaNav, {
  type PersonalTab,
} from "@/features/users/components/PersonalAreaNav";
// import ChangePasswordForm from "@/features/users/components/ChangePasswordForm";
// import ChangeEmailForm from "@/features/users/components/ChangeEmailForm";
import DeleteAccountSection from "../components/DeleteAccountSection";
import {
  canCreateCard,
  canUpdateCard,
  canDeleteCard,
  canAccessAdmin,
  canSeeCRM,
} from "@/features/users/auth/permissions";
import Button, { FormButton } from "@/components/common/Button";

type UpdateFormValues = Omit<SignUpDto, "password" | "address"> & {
  confirmPassword?: string;
  address: Omit<SignUpDto["address"], "zip"> & { zip?: string | number };
};

const cleanOptional = (v: unknown): string => {
  const s = typeof v === "string" ? v.trim() : "";
  return s.toLowerCase() === "not defined" ? "" : s;
};

function loadImageOk(url: string, timeout = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    const t = window.setTimeout(() => finish(false), timeout);
    img.onload = () => {
      window.clearTimeout(t);
      finish(true);
    };
    img.onerror = () => {
      window.clearTimeout(t);
      finish(false);
    };
    img.src = url;
  });
}

export default function PersonalAreaPage() {
  const { success, error } = useToast();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<PersonalTab>("info");
  const [submitting, setSubmitting] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState<{
    open: boolean;
    payload?: UpdateFormValues;
  }>({ open: false });
  const updateSchema: Joi.ObjectSchema = useMemo(() => {
    return signUpSchema
      .fork(["password", "confirmPassword"], (s) =>
        (s as Joi.StringSchema).optional().allow("")
      )
      .fork(
        [
          "phone",
          // "email",
          "image.url",
          "image.alt",
          "address.state",
          "address.country",
          "address.city",
          "address.street",
          "address.houseNumber",
          "address.zip",
          "isBusiness",
        ],
        (s) => (s as Joi.AnySchema).optional()
      );
  }, []);

  const methods = useForm<UpdateFormValues>({
    resolver: joiResolver(updateSchema, { abortEarly: false }),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      name: { first: "", middle: "", last: "" },
      phone: "",
      email: "",
      image: { url: "", alt: "" },
      address: {
        state: "",
        country: "",
        city: "",
        street: "",
        houseNumber: 1,
        zip: "",
      },
      isBusiness: false,
    },
  });

  const { handleSubmit, reset, formState } = methods;
  // Load current user
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  // Pre-fill form once user is fetched
  useEffect(() => {
    if (!me) return;
    reset({
      name: {
        first: me.name.first,
        middle: me.name.middle ?? "",
        last: me.name.last,
      },
      phone: me.phone,
      email: me.email,
      image: { url: me.image?.url ?? "", alt: me.image?.alt ?? "" },
      address: {
        state: cleanOptional(me.address?.state),
        country: me.address?.country ?? "",
        city: me.address?.city ?? "",
        street: me.address?.street ?? "",
        houseNumber: Number(me.address?.houseNumber ?? 1),
        zip:
          me.address?.zip !== undefined && me.address?.zip !== null
            ? String(me.address.zip)
            : "",
      },
      isBusiness: !!me.isBusiness,
    });
  }, [me, reset]);

  // Update profile (PUT) — as-is
  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateFormValues) => {
      if (!me) return;

      const rawUrl = (payload.image?.url ?? "").trim();
      const rawAlt = (payload.image?.alt ?? "").trim();
      const ok = rawUrl ? await loadImageOk(rawUrl) : false;
      const safeImage = ok
        ? { url: rawUrl, alt: rawAlt || DEFAULT_IMAGE.alt }
        : DEFAULT_IMAGE;

      const patch: Partial<User> = {
        name: {
          first: payload.name.first,
          middle: payload.name.middle ?? "",
          last: payload.name.last,
        },
        phone: payload.phone,
        image: safeImage,
        address: {
          state: payload.address.state ?? "",
          country: payload.address.country,
          city: payload.address.city,
          street: payload.address.street,
          houseNumber: Number(payload.address.houseNumber),
          zip:
            typeof payload.address.zip === "number"
              ? payload.address.zip
              : parseInt(String(payload.address.zip), 10),
        },
      };

      await updateUser(me._id, patch); // PUT
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["cards"] });
      success("הפרטים נשמרו בהצלחה", DEFAULT_DURATION.success);
    },
    onError: () => {
      error("שמירת הפרטים נכשלה", DEFAULT_DURATION.error);
    },
    onSettled: () => setSubmitting(false),
  });

  const toggleMutation = useMutation({
    mutationFn: async (payload: UpdateFormValues) => {
      if (!me) return;

      const rawUrl = (payload.image?.url ?? "").trim();
      const rawAlt = (payload.image?.alt ?? "").trim();
      const ok = rawUrl ? await loadImageOk(rawUrl) : false;
      const safeImage = ok
        ? { url: rawUrl, alt: rawAlt || DEFAULT_IMAGE.alt }
        : DEFAULT_IMAGE;

      // Send full allowed object; server flips isBusiness on PATCH
      const body: Partial<User> = {
        name: {
          first: payload.name.first,
          middle: payload.name.middle ?? "",
          last: payload.name.last,
        },
        phone: payload.phone,
        image: safeImage,
        address: {
          state: payload.address.state ?? "",
          country: payload.address.country,
          city: payload.address.city,
          street: payload.address.street,
          houseNumber: Number(payload.address.houseNumber),
          zip:
            typeof payload.address.zip === "number"
              ? payload.address.zip
              : parseInt(String(payload.address.zip), 10),
        },
      };

      await toggleUserStatus(me._id, body);
    },
    onSuccess: () => {
      success(
        "סוג החשבון עודכן. תבוצע יציאה והתחברות מחדש.",
        DEFAULT_DURATION.success
      );
      signOut();
      qc.clear();
      nav("/login", { replace: true });
    },
    onError: () => {
      error("עדכון סוג החשבון נכשל", DEFAULT_DURATION.error);
    },
    onSettled: () => setSubmitting(false),
  });

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!me) return;
      await deleteUser(me._id, { allowSelf: true });
    },
    onSuccess: () => {
      signOut();
      qc.clear();
      success("החשבון נמחק בהצלחה", DEFAULT_DURATION.success);
      nav("/");
    },
    onError: () => error("מחיקת החשבון נכשלה", DEFAULT_DURATION.error),
  });

  const onSubmit = (values: UpdateFormValues) => {
    setSubmitting(true);
    if (tab === "upgrade") {
      setLogoutConfirm({ open: true, payload: values });
    } else {
      updateMutation.mutate(values); // PUT
    }
  };

  if (isLoading || !me) {
    return (
      <main className="container mx-auto px-4 py-10" dir="rtl">
        <LoadingOverlay
          open={
            submitting || updateMutation.isPending || toggleMutation.isPending
          }
        />
        <div className="h-64" />
      </main>
    );
  }

  // --- role summary + tabs gating ---
  const role: "admin" | "business" | "user" = me.isAdmin
    ? "admin"
    : me.isBusiness
    ? "business"
    : "user";

  const allowedActions = [
    { label: "יצירת כרטיס", on: canCreateCard(role) },
    {
      label: "עריכת כרטיס (שלך / כלשהו)",
      on:
        canUpdateCard(role, { ownerId: me._id, currentUserId: me._id }) ||
        role === "admin",
    },
    {
      label: "מחיקת כרטיס (שלך / כלשהו)",
      on:
        canDeleteCard(role, { ownerId: me._id, currentUserId: me._id }) ||
        role === "admin",
    },
    { label: "גישה ל-CRM", on: canSeeCRM(role) },
    { label: "גישה לכלי אדמין", on: canAccessAdmin(role) },
    { label: "ייצוא CSV", on: role === "admin" },
  ];

  // Admin: hide “upgrade”; disable “delete” section
  const navTabs = [
    { key: "info" as PersonalTab, label: "פרטים אישיים" },
    { key: "address" as PersonalTab, label: "כתובת" },
    ...(role === "admin"
      ? []
      : [{ key: "upgrade" as PersonalTab, label: "סוג חשבון" }]),
    {
      key: "delete" as PersonalTab,
      label: "מחיקת חשבון",
      disabled: role === "admin",
    },
  ];

  return (
    <main className="container mx-auto py-20" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-xl font-semibold">אזור אישי</h1>

        {/* Status & permissions summary */}
        <section className="rounded-lg border p-4 bg-gray-50 dark:bg-muted-900">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              מצב חשבון:{" "}
              <strong>
                {role === "admin"
                  ? "אדמין"
                  : role === "business"
                  ? "עסקי"
                  : "רגיל"}
              </strong>
            </div>
            {role === "admin" && (
              <span className="text-xs px-2 py-0.5 rounded-full border bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                פעולות מסוכנות לעצמי מושבתות
              </span>
            )}
          </div>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs text-muted-700 dark:text-muted-300">
            {allowedActions.map((a) => (
              <li key={a.label} className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    a.on ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {a.label}
              </li>
            ))}
          </ul>
        </section>

        <PersonalAreaNav value={tab} onChange={setTab} tabs={navTabs} />

        <LoadingOverlay
          open={
            updateMutation.isPending ||
            toggleMutation.isPending ||
            deleteMutation.isPending
          }
        />

        {tab === "info" && (
          <FormProvider {...methods}>
            <form
              className="space-y-8 mx-auto"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <NameFields
                showMiddle={false}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NameFields showFirst={false} showLast={false} />
                <ContactFields
                  showEmail={false}
                  showPhone={true}
                  className=" md:grid-cols-1 gap-4"
                />
              </div>

              <ImageFields />
              <ActionsBar
                submitting={submitting || updateMutation.isPending}
                canSubmit
                isValid={formState.isValid}
                isSubmitting={formState.isSubmitting}
                onCancel={() => nav(-1)}
                submitLabel="שמור שינויים"
              />
            </form>
          </FormProvider>
        )}

        {tab === "address" && (
          <section className="mx-auto">
            <FormProvider {...methods}>
              <form
                className="space-y-6"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <AddressFields />
                <ActionsBar
                  submitting={submitting || updateMutation.isPending}
                  canSubmit
                  isValid={formState.isValid}
                  isSubmitting={formState.isSubmitting}
                  onCancel={() => setTab("info")}
                  submitLabel="שמור כתובת"
                />
              </form>
            </FormProvider>
          </section>
        )}

        {/*         {tab === "email" && me && (
          <section className="mx-auto">
            <ChangeEmailForm
              userId={me._id}
              currentEmail={me.email}
              onDone={() => setTab("info")}
            />
          </section>
        )}

        {tab === "password" && me && (
          <section className="mx-auto">
            <ChangePasswordForm userId={me._id} onDone={() => setTab("info")} />
          </section>
        )} */}

        {tab === "upgrade" && (
          <section className="max-w-lg mx-auto space-y-4">
            <div className="rounded-md border p-4">
              <p className="text-sm">
                מצב חשבון נוכחי:{" "}
                <strong>{me.isBusiness ? "עסקי" : "רגיל"}</strong>
              </p>
              <ul className="list-disc pr-5 text-xs mt-2 space-y-1 text-muted-700 dark:text-muted-300">
                {me.isBusiness ? (
                  <>
                    <li>גישה ליצירה ועריכה של כרטיסים עסקיים.</li>
                    <li>כלי ניהול מתקדמים: מחיקה, עדכון, ייצוא CSV.</li>
                    <li>תיוג ונראות ייעודית למשתמשים עסקיים ברחבי המערכת.</li>
                    <li>תמיכה עתידית בהרשאות מתקדמות וניהול צוות.</li>
                  </>
                ) : (
                  <>
                    <li>חשבון רגיל: צפייה ושמירה למועדפים בלבד.</li>
                    <li>אין יצירה/עריכה של כרטיסים עסקיים.</li>
                    <li>אין כלי ניהול מתקדמים או ייצוא CSV.</li>
                    <li>ניתן לעבור ל“עסקי” בכל עת ע״י לחיצה על הכפתור מטה.</li>
                  </>
                )}
              </ul>
            </div>

            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                <ActionsBar
                  submitting={
                    submitting ||
                    updateMutation.isPending ||
                    toggleMutation.isPending
                  }
                  canSubmit
                  isValid={formState.isValid}
                  isSubmitting={formState.isSubmitting}
                  onCancel={() => setTab("info")}
                  submitLabel={
                    tab === "upgrade" ? "שנה סוג חשבון" : "שמור שינויים"
                  }
                />
              </form>
            </FormProvider>
          </section>
        )}

        {tab === "delete" && (
          <DeleteAccountSection
            pending={deleteMutation.isPending}
            onConfirmDelete={() => deleteMutation.mutate()}
            disabled={me.isAdmin}
            disabledReason="משתמש אדמין אינו יכול למחוק את החשבון של עצמו."
          />
        )}
      </div>
      {logoutConfirm.open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          className="fixed inset-0 z-[1200] grid place-items-center"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setSubmitting(false);
              setLogoutConfirm({ open: false });
            }}
            aria-hidden
          />
          <div className="relative z-[1201] w-[92vw] max-w-md rounded-xl bg-white dark:bg-muted-900 border border-muted-200 dark:border-muted-700 shadow-xl p-0">
            <header className="px-5 pt-5">
              <h2 id="logout-confirm-title" className="text-lg font-semibold">
                שינוי סוג חשבון
              </h2>
              <p className="text-sm text-muted-600 dark:text-muted-300 mt-1">
                לאחר אישור השינוי תתבצע <strong>יציאה אוטומטית</strong> ותועבר/י
                לעמוד ההתחברות.
              </p>
            </header>

            <div className="px-5 py-4 text-sm text-muted-700 dark:text-muted-300">
              האם לאשר שינוי סוג חשבון? ניתן להתחבר מחדש מיד לאחר מכן.
            </div>

            <footer className="px-5 pb-5 flex gap-2 justify-start">
              <FormButton
                type="submit"
                className="u-btn u-btn-submit"
                onClick={() => {
                  if (!logoutConfirm.payload) return;
                  toggleMutation.mutate(logoutConfirm.payload);
                  setLogoutConfirm({ open: false });
                }}
                disabled={toggleMutation.isPending}
              >
                אשר והמשך
              </FormButton>
              <Button
                type="button"
                className="u-btn u-btn-cancel"
                onClick={() => {
                  setSubmitting(false);
                  setLogoutConfirm({ open: false });
                }}
              >
                ביטול
              </Button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
