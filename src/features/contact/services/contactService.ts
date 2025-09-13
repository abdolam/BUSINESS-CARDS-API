import axios from "axios";
import type { ContactDto } from "../validators/contactSchemas";

const CONTACT_API = import.meta.env.VITE_CONTACT_API_URL ?? "";

// Optional metadata the server can use for triage/spam checks
export type ContactMeta = {
  url?: string;
  locale?: string;
  ua?: string;
  fillMs?: number; // how long the user spent filling the form
  honeypotFilled?: boolean; // whether the bait field was filled
  captchaProvider?: "turnstile" | "hcaptcha" | "recaptcha";
  captchaToken?: string;
  hvToken?: string; // compact encoded human-verification payload
};

export async function sendContact(dto: ContactDto, meta?: ContactMeta) {
  if (!CONTACT_API) {
    const err = new Error("No contact API configured") as Error & {
      code?: string;
    };
    err.code = "NO_ENDPOINT";
    throw err;
  }
  const api = axios.create({ baseURL: CONTACT_API, timeout: 15000 });
  const body = meta ? { ...dto, meta } : dto; // ← include meta if provided
  const { data } = await api.post("/contact", body);
  return data;
}
