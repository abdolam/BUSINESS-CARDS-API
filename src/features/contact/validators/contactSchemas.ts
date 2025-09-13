import Joi from "joi";
import { emailSchema } from "@/features/users/validators/userSchemas";

const msgs = {
  required: "שדה חובה",
  min: "הערך קצר מדי",
  max: "הערך ארוך מדי",
  pattern: "הערך לא תואם את התבנית המבוקשת",
};

export const phoneRegex = /^0\d{1,2}-?\d{7}$/;

export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.empty": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  email: emailSchema.label("אימייל"),
  phone: Joi.string().allow("").pattern(phoneRegex).messages({
    "string.pattern.base": "מספר טלפון לא תקין (פורמט ישראלי)",
  }),
  subject: Joi.string().min(2).max(256).required().empty("").messages({
    "any.required": msgs.required,
    "string.empty": msgs.required,
    "string.min": msgs.min,
    "string.max": msgs.max,
  }),
  message: Joi.string().min(5).max(2000).required().empty("").messages({
    "any.required": msgs.required,
    "string.empty": msgs.required,
    "string.min": "ההודעה קצרה מדי",
    "string.max": "ההודעה ארוכה מדי",
  }),
});
export type ContactDto = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};
