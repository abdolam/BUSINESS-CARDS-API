import Joi from "joi";

const msgs = {
  required: "שדה חובה",
  min: "הערך קצר מדי",
  max: "הערך ארוך מדי",
  email: "אימייל לא תקין",
  pattern: "הערך לא תואם את התבנית המבוקשת",
  number: "יש להזין מספר תקין",
};

// ── Reusable primitives ────────────────────────────────────────────────────────
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    "any.required": "שדה חובה",
    "string.empty": "שדה חובה",
    "string.email": "כתובת אימייל לא תקינה",
    "string.pattern.base": "כתובת אימייל לא תקינה",
  });

const strongPasswordSchema = Joi.string()
  .min(8)
  .max(1024)
  .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/)
  .required()
  .empty("")
  .messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
    "string.pattern.base":
      "הסיסמה חייבת להכיל 8–64 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד",
  });

const phoneSchema = Joi.string()
  .pattern(/^0\d{1,2}-?\d{7}$/)
  .min(9)
  .max(11)
  .required()
  .empty("")
  .messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
    "string.pattern.base": "מספר טלפון לא תקין (פורמט ישראלי)",
  });

const urlRegex = /^(https?:\/\/)([\w.-]+)(:[0-9]+)?(\/[^\s]*)?$/;

// composite objects used by signup
const nameSchema = Joi.object({
  first: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  middle: Joi.string().min(2).max(256).allow("").messages({
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  last: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
});

const imageSchema = Joi.object({
  url: Joi.string().pattern(urlRegex).required().empty("").messages({
    "any.required": msgs.required,
    "string.pattern.base": "כתובת התמונה חייבת להיות URL תקין (http/https)",
  }),
  alt: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
});

const addressSchema = Joi.object({
  state: Joi.string().allow("").max(256).messages({ "string.max": msgs.max }),
  country: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  city: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  street: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  houseNumber: Joi.number().integer().min(1).required().empty("").messages({
    "any.required": msgs.required,
    "number.base": msgs.number,
    "number.min": "מספר הבית חייב להיות לפחות 1",
  }),
  zip: Joi.string()
    .pattern(/^\d{2,}$/)
    .required()
    .empty("") // treats "" as empty (required)
    .messages({
      "any.required": msgs.required, // שדה חובה
      "string.empty": msgs.required, // שדה חובה
      "string.pattern.base": "המיקוד חייב להיות מספר עם לפחות שתי ספרות",
    })
    .label("מיקוד"),
});

const strongPwdRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/;

export const signInSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "any.required": "שדה חובה",
      "string.empty": "שדה חובה",
      "string.email": "כתובת אימייל לא תקינה",
      "string.pattern.base": "כתובת אימייל לא תקינה",
    }),

  password: Joi.string()
    .pattern(strongPwdRegex) // ← restore full regex validation
    .required()
    .messages({
      "any.required": "שדה חובה",
      "string.empty": "שדה חובה",
      "string.pattern.base":
        "הסיסמה חייבת להכיל 8–64 תווים, אות גדולה, אות קטנה, מספר ותו מיוחד",
    }),
}).prefs({ errors: { label: "key", wrap: { label: false } } });

const confirmPassword = Joi.string()
  .valid(Joi.ref("password"))
  .required()
  .empty("")
  .messages({
    "any.only": "הסיסמאות אינן תואמות",
    "any.required": msgs.required,
  });

export const signUpSchema = Joi.object({
  name: nameSchema.label("שם").required(),
  phone: phoneSchema.label("טלפון"),
  email: emailSchema.label("אימייל"),
  password: strongPasswordSchema.label("סיסמה"),
  confirmPassword,
  image: imageSchema.label("תמונה").required(),
  address: addressSchema.label("כתובת").required(),
  isBusiness: Joi.boolean().default(false),
});

// Forgot password: same email rules
export const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

// Reset password: lighter 6–64 to match your UI
export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).max(64).required().empty("").messages({
    "string.min": "הסיסמה חייבת להכיל לפחות 6 תווים",
    "any.required": "הסיסמה היא שדה חובה",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "הסיסמאות אינן תואמות",
    "any.required": "אישור סיסמה הוא שדה חובה",
  }),
});
