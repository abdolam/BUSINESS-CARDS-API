import { Mail, Phone } from "lucide-react";

type Props = { email?: string; phone?: string };

export default function ContactIcons({ email, phone }: Props) {
  return (
    <div className="flex items-center justify-center gap-3">
      {email && (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
          title="שלח דוא״ל"
        >
          <Mail className="w-4 h-4" />
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-1 px-2 py-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
          title="התקשר"
        >
          <Phone className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
