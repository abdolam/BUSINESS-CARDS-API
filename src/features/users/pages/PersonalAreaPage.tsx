import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  NameFields,
  ContactFields,
  ImageFields,
  AddressFields,
  BusinessToggle,
  ActionsBar,
} from "@/components/forms";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import {
  getMe,
  updateUser,
  deleteUser,
  signOut,
} from "@/features/users/services/userService";
import { signUpSchema } from "@/features/users/validators/userSchemas";
import type { SignUpDto, User } from "@/types/user";
import { DEFAULT_IMAGE } from "@/features/users/constants/userDefaults";
import { useNavigate } from "react-router-dom";

type UpdateFormValues = Omit<SignUpDto, "password"> & {
  // not rendered; kept optional so forked schema won’t complain
  confirmPassword?: string;
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
  const [submitting, setSubmitting] = useState(false);
  // Reuse existing signup schema, but make password fields optional for updates
  const updateSchema: Joi.ObjectSchema = useMemo(
    () =>
      signUpSchema.fork(["password", "confirmPassword"], (s) =>
        (s as Joi.StringSchema).optional().allow("")
      ),
    []
  );

  const methods = useForm<UpdateFormValues>({
    resolver: joiResolver(updateSchema, { abortEarly: false }),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      // will be replaced by reset(me) when loaded
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
        zip: undefined as unknown as number,
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
        state: me.address?.state ?? "",
        country: me.address?.country ?? "",
        city: me.address?.city ?? "",
        street: me.address?.street ?? "",
        houseNumber: Number(me.address?.houseNumber ?? 1),
        zip:
          typeof me.address?.zip === "number"
            ? me.address.zip
            : (me.address?.zip as unknown as number),
      },
      isBusiness: !!me.isBusiness,
    });
  }, [me, reset]);

  // Update profile
  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateFormValues) => {
      if (!me) return;

      const rawUrl = (payload.image?.url ?? "").trim();
      const rawAlt = (payload.image?.alt ?? "").trim();
      const ok = rawUrl ? await loadImageOk(rawUrl) : false;
      const safeImage = ok
        ? { url: rawUrl, alt: rawAlt || DEFAULT_IMAGE.alt }
        : DEFAULT_IMAGE;

      // Build a minimal, allowed patch for the API
      const patch: Partial<User> = {
        name: {
          first: payload.name.first,
          middle: payload.name.middle ?? "",
          last: payload.name.last,
        },
        phone: payload.phone,
        email: payload.email,
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
        isBusiness: !!payload.isBusiness,
      };

      await updateUser(me._id, patch);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["cards"] }); // if name/avatar shows on cards
      success("הפרטים נשמרו בהצלחה", DEFAULT_DURATION.success);
    },
    onError: () => {
      error("שמירת הפרטים נכשלה", DEFAULT_DURATION.error);
    },
    onSettled: () => setSubmitting(false),
  });

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!me) return;
      await deleteUser(me._id);
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
    updateMutation.mutate(values);
  };

  if (isLoading || !me) {
    return (
      <main className="container mx-auto px-4 py-10" dir="rtl">
        <LoadingOverlay open />
        <div className="h-64" />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8" dir="rtl">
      <LoadingOverlay open={submitting || updateMutation.isPending} />
      <h1 className="text-xl font-semibold mb-4">אזור אישי</h1>

      <FormProvider {...methods}>
        <form
          className="space-y-5 max-w-3xl"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <NameFields />
          <ContactFields />
          <ImageFields />
          <AddressFields />
          <BusinessToggle />

          <ActionsBar
            submitting={submitting || updateMutation.isPending}
            canSubmit={true}
            isValid={formState.isValid}
            isSubmitting={formState.isSubmitting}
            onCancel={() => nav(-1)}
            submitLabel="שמור שינויים"
          />
        </form>
      </FormProvider>

      <hr className="my-8 border-muted-200 dark:border-muted-700" />

      <section className="max-w-3xl">
        <h2 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
          מחיקת חשבון
        </h2>
        <p className="text-sm text-muted-700 dark:text-muted-300 mb-3">
          מחיקת החשבון תסיר את כל הנתונים המשויכים אליך (כולל כרטיסים ולייקים).
          פעולה זו אינה הפיכה.
        </p>
        <button
          type="button"
          className="u-btn u-btn-danger"
          onClick={() => {
            if (window.confirm("למחוק את החשבון לצמיתות?")) {
              deleteMutation.mutate();
            }
          }}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "מוחק…" : "מחק חשבון"}
        </button>
      </section>
    </main>
  );
}
