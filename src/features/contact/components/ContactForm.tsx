import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { contactSchema, type ContactDto } from "../validators/contactSchemas";
import { sendContact } from "../services/contactService";
import { useToast, DEFAULT_DURATION } from "@/components/feedback/toastContext";
import { useState } from "react";
import type { HVContextValue } from "@/features/human-verification/HumanVerificationContext";
import { useNavigate } from "react-router-dom";
import {
  useHumanVerification,
  HiddenHoneypotField,
} from "@/features/human-verification";
import Button, { FormButton } from "@/components/common/Button";
import { HVSection } from "@/components/forms";

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL ?? "abdola.marhaj@gmail.com";

type FormValues = ContactDto;

export default function ContactForm() {
  const hv = useHumanVerification() as HVContextValue;
  const { error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: joiResolver(contactSchema.unknown(true), { abortEarly: false }),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const genTrackingId = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `CT-${y}${m}${day}-${rand}`;
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const rest = values;

      // Rely on global HV:
      if (!hv.canSubmit) {
        // soft-fail to sent page to avoid bot loops
        const trackingId = genTrackingId();
        hv.refresh();
        navigate("/contact/sent", { replace: true, state: { trackingId } });
        return;
      }
      const payload: ContactDto = {
        ...rest,
        email: rest.email.trim().toLowerCase(),
        phone: rest.phone?.trim() || "",
      };

      const meta = {
        url: window.location.href,
        locale: document.documentElement.lang || navigator.language,
        ua: navigator.userAgent,
        fillMs: hv.signals.dwellMs,
        honeypotFilled: hv.signals.honeypotFilled,
        ...(hv.signals.captchaProvider && hv.signals.captchaToken
          ? {
              captchaProvider: hv.signals.captchaProvider as "turnstile",
              captchaToken: hv.signals.captchaToken,
            }
          : {}),
        hvToken: hv.hvToken ?? undefined,
      } as const;

      await sendContact(payload, meta);

      const trackingId = genTrackingId();
      hv.refresh();
      navigate("/contact/sent", { replace: true, state: { trackingId } });
    } catch (e: unknown) {
      const hasCode = (v: unknown): v is { code: string } =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as Record<string, unknown>).code === "string";

      const isNoEndpoint = hasCode(e) && e.code === "NO_ENDPOINT";
      if (!isNoEndpoint) {
        error("שגיאה בחיבור לשרת — פותחים דוא״ל במקום", DEFAULT_DURATION.error);
      }

      const subject = encodeURIComponent(values.subject || "פנייה מהאתר");
      const body = encodeURIComponent(
        `שם: ${values.name}\nאימייל: ${values.email}\nטלפון: ${
          values.phone || "-"
        }\n\nהודעה:\n${values.message}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

      const trackingId = genTrackingId();
      hv.refresh();
      navigate("/contact/sent", { replace: true, state: { trackingId } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      dir="rtl"
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      aria-label="צור קשר"
      noValidate
      onFocusCapture={hv.startGate}
      onMouseDownCapture={hv.startGate}
      onKeyDownCapture={hv.startGate}
      onPointerMoveCapture={hv.startGate}
    >
      <HiddenHoneypotField />
      <div>
        <label className="u-label" htmlFor="name">
          שם מלא *
        </label>
        <input
          id="name"
          className="u-input"
          {...register("name")}
          onFocus={hv.startGate}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          autoComplete="full-name"
        />
        {errors.name && (
          <p
            id="contact-name-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {errors.name.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="u-label" htmlFor="email">
            אימייל *
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            className="u-input"
            {...register("email")}
            onFocus={hv.startGate}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email && (
            <p
              id="contact-email-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {errors.email.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="u-label" htmlFor="phone">
            טלפון
          </label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            className="u-input"
            placeholder="05X-XXXXXXX"
            {...register("phone")}
            onFocus={hv.startGate}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          />
          {errors.phone && (
            <p
              id="contact-phone-error"
              role="alert"
              className="text-red-600 text-xs mt-1"
            >
              {errors.phone.message as string}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="u-label" htmlFor="subject">
          נושא *
        </label>
        <input
          id="subject"
          className="u-input"
          {...register("subject")}
          onFocus={hv.startGate}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={
            errors.subject ? "contact-subject-error" : undefined
          }
        />
        {errors.subject && (
          <p
            id="contact-subject-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {errors.subject.message as string}
          </p>
        )}
      </div>

      <div>
        <label className="u-label" htmlFor="message">
          הודעה *
        </label>
        <textarea
          id="message"
          className="u-input min-h-[8rem]"
          {...register("message")}
          onFocus={hv.startGate}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
        />
        {errors.message && (
          <p
            id="contact-message-error"
            role="alert"
            className="text-red-600 text-xs mt-1"
          >
            {errors.message.message as string}
          </p>
        )}
      </div>

      <div className="flex gap-3 justify-start pt-2">
        <FormButton
          type="submit"
          className="u-btn u-btn-submit"
          disabled={!isValid || isSubmitting || submitting || !hv.canSubmit}
        >
          שליחה
        </FormButton>
        <Button
          type="button"
          className="u-btn u-btn-cancel"
          onClick={() => reset()}
        >
          ניקוי
        </Button>
      </div>
      <HVSection />
    </form>
  );
}
