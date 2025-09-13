import { useForm, FormProvider } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import type { SignUpDto } from "@/types/user";
import { signUpSchema } from "../validators/userSchemas";
import { signUp } from "../services/userService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import { useHumanVerification } from "@/features/human-verification/useHumanVerification";
import {
  NameFields,
  ContactFields,
  PasswordFields,
  ImageFields,
  AddressFields,
  ActionsBar,
  BusinessToggle,
  HVSection,
} from "@/components/forms";
import { DEFAULT_IMAGE } from "../constants/userDefaults";

function loadImageOk(url: string, timeout = 5000): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      resolve(ok);
    };
    const timer = window.setTimeout(() => finish(false), timeout);

    img.onload = () => {
      window.clearTimeout(timer);
      finish(true);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish(false);
    };
    img.src = url;
  });
}

type SignUpFormValues = SignUpDto & { confirmPassword: string };

export default function SignUpForm() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { success, error } = useToast();
  // Keep HV flow for UX; do not include HV tokens in server payload
  const { canSubmit, startGate } = useHumanVerification();

  const methods = useForm<SignUpFormValues>({
    resolver: joiResolver(signUpSchema, { abortEarly: false }),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {}, // form starts empty; we handle fallbacks at submit time
  });

  const { handleSubmit } = methods;

  const onSubmit = async (values: SignUpFormValues) => {
    setSubmitting(true);
    try {
      // Normalize email
      const email =
        typeof values.email === "string"
          ? values.email.trim().toLowerCase()
          : values.email;

      // Validate/replace image URL (fallback to DEFAULT_IMAGE if invalid)
      const rawUrl = (values.image?.url ?? "").trim();
      const rawAlt = (values.image?.alt ?? "").trim();
      const ok = rawUrl ? await loadImageOk(rawUrl) : false;
      const safeImage = ok
        ? { url: rawUrl, alt: rawAlt || DEFAULT_IMAGE.alt }
        : DEFAULT_IMAGE;

      // Build STRICT, whitelisted DTO (exclude confirmPassword & any HV fields)
      const requestBody: SignUpDto = {
        name: {
          first: values.name.first,
          middle: values.name.middle ?? "",
          last: values.name.last,
        },
        phone: values.phone,
        email,
        password: values.password,
        image: safeImage,
        address: {
          state: values.address.state ?? "",
          country: values.address.country,
          city: values.address.city,
          street: values.address.street,
          houseNumber: Number(values.address.houseNumber),
          zip:
            typeof values.address.zip === "number"
              ? values.address.zip
              : parseInt(String(values.address.zip), 10),
        },
        isBusiness: !!values.isBusiness,
      };

      await signUp(requestBody);

      success("ההרשמה בוצעה בהצלחה");
      setTimeout(() => navigate("/login"), DEFAULT_DURATION.success);
    } catch (e: unknown) {
      // Type guards
      const isRecord = (v: unknown): v is Record<string, unknown> =>
        typeof v === "object" && v !== null;
      const asString = (v: unknown): string | undefined =>
        typeof v === "string" ? v : undefined;

      let status: number | undefined;
      let serverMsg = "";

      // Pull status/message from the error (Axios-like)
      if (isRecord(e)) {
        if (typeof e["status"] === "number") status = e["status"] as number;

        const cause = e["cause"];
        if (isRecord(cause) && typeof cause["status"] === "number") {
          status = cause["status"] as number;
        }

        const resp = e["response"];
        if (isRecord(resp)) {
          if (typeof resp["status"] === "number") {
            status = resp["status"] as number;
          }
          const data = resp["data"];
          if (typeof data === "string") {
            serverMsg = data;
          } else if (isRecord(data)) {
            serverMsg =
              asString(data["message"]) ?? asString(data["error"]) ?? "";
          }
        }
      }

      // Duplicate email detection (400 string body or proper 409)
      const isDuplicateEmail =
        status === 409 ||
        /already\s*(registered|exists?)/i.test(serverMsg) ||
        (/duplicate\s*key/i.test(serverMsg) && /email/i.test(serverMsg)) ||
        /אימייל.*(קיים|כבר\s*רשום)/.test(serverMsg);

      if (isDuplicateEmail) {
        const friendly = "האימייל הזה כבר רשום במערכת";
        error(friendly, DEFAULT_DURATION.error);
        methods.setError("email", { type: "server", message: friendly });
        return;
      }

      if (status === 400) {
        error(
          serverMsg || "פרטי הרשמה לא תקינים. בדוק שוב את הנתונים.",
          DEFAULT_DURATION.error
        );
        return;
      }

      // Anything else (network/server)
      error("שגיאה בחיבור לשרת", DEFAULT_DURATION.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        dir="rtl"
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        onFocusCapture={() => startGate()}
        onMouseDownCapture={() => startGate()}
        onKeyDownCapture={() => startGate()}
        aria-label="טופס הרשמה"
        noValidate
      >
        <NameFields />
        <ContactFields />
        <PasswordFields />
        <ImageFields />
        <AddressFields />
        <BusinessToggle />
        <ActionsBar
          submitting={submitting}
          canSubmit={canSubmit}
          isValid={methods.formState.isValid}
          isSubmitting={methods.formState.isSubmitting}
          onCancel={() => history.back()}
          submitLabel="הרשמה"
        />
        <HVSection />
      </form>
    </FormProvider>
  );
}
