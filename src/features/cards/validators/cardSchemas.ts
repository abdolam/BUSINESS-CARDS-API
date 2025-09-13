import Joi from "joi";
import { emailSchema } from "../../users/validators/userSchemas"; // reuse same email rules

// Consistent localized messages (mirrors users/validators style)
const msgs = {
  required: "שדה חובה",
  min: "הערך קצר מדי",
  max: "הערך ארוך מדי",
  email: "אימייל לא תקין",
  pattern: "הערך לא תואם את התבנית המבוקשת",
  number: "יש להזין מספר תקין",
};

// Same URL + phone patterns as users validation
const urlRegex = /^(https?:\/\/)([\w.-]+)(:[0-9]+)?(\/[^\s]*)?$/;
const ilPhoneRegex = /^0\d{1,2}-?\d{7}$/;

// Reusable fields
export const cardImageSchema = Joi.object({
  url: Joi.string().pattern(urlRegex).required().empty("").messages({
    "any.required": msgs.required,
    "string.pattern.base": "כתובת התמונה חייבת להיות URL תקין (http/https)",
    "string.empty": msgs.required,
  }),
  alt: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
});

export const cardAddressSchema = Joi.object({
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
  // NOTE: For cards, zip is optional number (matches card API),
  // while user schema uses required string pattern.
  zip: Joi.number().integer().min(0).optional().messages({
    "number.base": msgs.number,
  }),
});

// Compose card schema (keeps parity with your project brief)
export const createCardSchema = Joi.object({
  title: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  subtitle: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  description: Joi.string().min(2).max(1024).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  phone: Joi.string()
    .pattern(ilPhoneRegex)
    .min(9)
    .max(11)
    .required()
    .empty("")
    .messages({
      "any.required": msgs.required,
      "string.min": msgs.min,
      "string.max": msgs.max,
      "string.pattern.base": "מספר טלפון לא תקין (פורמט ישראלי)",
    }),
  // Reuse the exact email rules from users, and add the ≥5 constraint
  email: emailSchema.min(5),
  web: Joi.string().pattern(urlRegex).min(14).required().empty("").messages({
    "any.required": msgs.required,
    "string.min": msgs.min,
    "string.pattern.base": "האתר חייב להיות URL תקין (http/https)",
  }),
  image: cardImageSchema.required(),
  address: cardAddressSchema.required(),
}).prefs({
  abortEarly: false,
  stripUnknown: true,
  errors: { label: "key", wrap: { label: false } },
});
