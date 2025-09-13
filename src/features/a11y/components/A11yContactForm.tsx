import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { emailSchema } from "@/features/users/validators/userSchemas";
import { useHumanVerification } from "@/features/human-verification/useHumanVerification";
import { X } from "lucide-react";
import Button, { FormButton } from "@/components/common/Button";
import { HVSection } from "@/components/forms";

/** Set your inbox here or read from env */
const CONTACT_EMAIL = "abdola.marhaj@gmail.com";

type FeedbackValues = { name: string; email: string; message: string };

const feedbackSchema = Joi.object({
  name: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": "שדה חובה",
    "string.empty": "שדה חובה",
    "string.min": "השם קצר מדי",
    "string.max": "השם ארוך מדי",
  }),
  email: emailSchema.label("אימייל"),
  message: Joi.string().min(5).max(2000).required().empty("").messages({
    "any.required": "שדה חובה",
    "string.empty": "שדה חובה",
    "string.min": "ההודעה קצרה מדי",
    "string.max": "ההודעה ארוכה מדי",
  }),
});

type Props = {
  onClose: () => void;
};

export default function A11yContactForm({ onClose }: Props) {
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<FeedbackValues>({
    resolver: joiResolver(feedbackSchema, { abortEarly: false }),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
  });

  const { canSubmit, captchaEnabled, signals, startGate, hvToken } =
    useHumanVerification();

  useEffect(() => {
    const id = setTimeout(() => firstFieldRef.current?.focus(), 10);
    return () => clearTimeout(id);
  }, []);

  const submitFeedback = ({ name, email, message }: FeedbackValues) => {
    const subject = encodeURIComponent("משוב נגישות מהאתר");

    const hvLines: string[] = [];
    if (hvToken) hvLines.push(`HV-Token: ${hvToken}`);
    if (captchaEnabled && signals?.captchaToken)
      hvLines.push(`Turnstile: ${signals.captchaToken}`);

    const body = encodeURIComponent(
      `שם: ${name || "-"}\nאימייל: ${email?.trim().toLowerCase() || "-"}\n\n` +
        `הודעה:\n${message}\n\n` +
        (hvLines.length ? `---\n${hvLines.join("\n")}` : "")
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    reset();
    onClose?.();
  };

  return (
    <form
      onSubmit={handleSubmit(submitFeedback)}
      onFocusCapture={() => startGate()}
      onMouseDownCapture={() => startGate()}
      onKeyDownCapture={() => startGate()}
      aria-label="טופס משוב"
      className="space-y-4"
      noValidate
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 left-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="סגירת טופס המשוב"
      >
        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden />
      </button>
      <div>
        <label htmlFor="fb-name" className="u-label">
          שם *
        </label>
      </div>
      <input
        id="fb-name"
        className="u-input"
        autoComplete="name"
        aria-invalid={errors.name ? true : undefined}
        aria-describedby={errors.name ? "fb-name-error" : undefined}
        {...(() => {
          const { ref, ...rest } = register("name");
          return {
            ref: (el: HTMLInputElement | null) => {
              firstFieldRef.current = el;
              ref(el);
            },
            ...rest,
          };
        })()}
      />
      {errors.name && (
        <p
          id="fb-name-error"
          role="alert"
          className="text-red-600 text-xs mt-1"
        >
          {String(errors.name.message)}
        </p>
      )}
      <div>
        <label htmlFor="fb-email" className="u-label">
          אימייל *
        </label>
      </div>
      <input
        id="fb-email"
        type="email"
        className="u-input"
        dir="ltr"
        inputMode="email"
        autoComplete="email"
        aria-invalid={errors.email ? true : undefined}
        aria-describedby={errors.email ? "fb-email-error" : undefined}
        {...register("email")}
      />
      {errors.email && (
        <p
          id="fb-email-error"
          role="alert"
          className="text-red-600 text-xs mt-1"
        >
          {String(errors.email.message)}
        </p>
      )}
      <div>
        <label htmlFor="fb-msg" className="u-label">
          הודעה *
        </label>
      </div>
      <textarea
        id="fb-msg"
        className="u-input min-h-[6rem]"
        aria-invalid={errors.message ? true : undefined}
        aria-describedby={errors.message ? "fb-msg-error" : undefined}
        {...register("message")}
      />
      {errors.message && (
        <p id="fb-msg-error" role="alert" className="text-red-600 text-xs mt-1">
          {String(errors.message.message)}
        </p>
      )}
      <div className="flex justify-between items-center mt-6 gap-3">
        <FormButton
          type="submit"
          disabled={!isValid || isSubmitting || !canSubmit}
          className="u-btn u-btn-submit"
        >
          שלח משוב
        </FormButton>
        <Button type="button" onClick={onClose} className="u-btn u-btn-cancel">
          ביטול
        </Button>
      </div>
      <HVSection />
    </form>
  );
}
