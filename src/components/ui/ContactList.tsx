import { Mail, Phone, MapPin } from "lucide-react";

type Props = {
  email?: string;
  phone?: string;
  address?: string;
  className?: string;
};

export default function ContactList({
  email,
  phone,
  address,
  className,
}: Props) {
  return (
    <ul className={className ?? "space-y-2 text-sm"} dir="rtl">
      {email && (
        <li className="flex items-center gap-2">
          <Mail className="h-4 w-4 opacity-80" />
          <a
            href={`mailto:${email}`}
            className="hover:text-primary-600 dark:hover:text-primary-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
          >
            {email}
          </a>
        </li>
      )}
      {phone && (
        <li className="flex items-center gap-2">
          <Phone className="h-4 w-4 opacity-80" />
          <a
            href={`tel:${phone}`}
            className="hover:text-primary-600 dark:hover:text-primary-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
          >
            {phone}
          </a>
        </li>
      )}
      {address && (
        <li className="flex items-center gap-2">
          <MapPin className="h-4 w-4 opacity-80" />
          <span>{address}</span>
        </li>
      )}
    </ul>
  );
}
