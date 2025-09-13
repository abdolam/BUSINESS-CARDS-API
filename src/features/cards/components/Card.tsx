import { Heart, Phone as PhoneIcon, Trash2, Info, Pencil } from "lucide-react";

export type CardProps = {
  image: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  phone?: string;
  addressText?: string;
  bizNumber?: number;
  likesCount?: number;
  isFavorite?: boolean;
  canLike?: boolean;
  canDelete?: boolean;
  canUpdate?: boolean;
  canInfo?: boolean;
  onLike?: () => void;
  onDelete?: () => void;
  onInfo?: () => void;
  onUpdate?: () => void;
};

export default function Card({
  image,
  imageAlt = "card image",
  title,
  subtitle,
  phone,
  addressText,
  bizNumber,
  likesCount = 0,
  isFavorite = false,
  canLike = false,
  canDelete = false,
  canUpdate = false,
  canInfo = false,
  onLike,
  onDelete,
  onInfo,
  onUpdate,
}: CardProps) {
  return (
    <article
      className="
    bg-white dark:bg-muted-900
    border border-muted-200 dark:border-muted-700
    rounded-2xl overflow-hidden shadow-sm
    transition-transform duration-200 hover:shadow-lg hover:scale-[1.01]
    flex flex-col h-full
  "
    >
      <div className="relative">
        <img
          src={image}
          alt={imageAlt}
          className="w-full aspect-video object-cover"
        />

        {canLike && (
          <button
            onClick={onLike}
            className="absolute top-2 right-2 p-1.5 rounded-full
                       bg-white/85 dark:bg-muted-800/85
                       ring-1 ring-muted-200 dark:ring-muted-700
                       hover:bg-white dark:hover:bg-muted-700 transition"
            aria-label={isFavorite ? "Unlike" : "Like"}
            aria-pressed={isFavorite}
            title={isFavorite ? "הסר ממועדפים" : "הוסף למועדפים"}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? "text-red-500" : ""}`}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        )}
      </div>

      <div dir="rtl" className="p-4 space-y-1 text-right flex-1">
        <h3 className="text-lg font-semibold text-muted-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-500 dark:text-muted-400">
            {subtitle}
          </p>
        )}
        {phone && (
          <p className="text-sm text-muted-700 dark:text-muted-300">
            <span className="font-medium">טלפון:</span>{" "}
            <a
              href={`tel:${phone}`}
              dir="ltr"
              className="hover:text-primary-600 dark:hover:text-primary-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-sm"
              aria-label="Call"
              title="Call"
            >
              {phone}
            </a>
          </p>
        )}

        {addressText && (
          <p className="text-sm text-muted-700 dark:text-muted-300">
            <span className="font-medium">כתובת:</span> {addressText}
          </p>
        )}
        {bizNumber !== undefined && (
          <p className="text-sm text-muted-700 dark:text-muted-300">
            <span className="font-medium">מס' כרטיס:</span> {bizNumber}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between px-4 py-2 border-t border-muted-200 dark:border-muted-700">
        <div className="flex items-center gap-1 text-sm text-muted-600 dark:text-muted-300">
          <Heart className="w-4 h-4" />
          <span>{likesCount}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="p-1.5 rounded-full hover:bg-muted-100 dark:hover:bg-muted-800"
              aria-label="Call"
              title="Call"
            >
              <PhoneIcon className="w-4 h-4" />
            </a>
          )}

          {canInfo && onInfo && (
            <button
              onClick={onInfo}
              className="p-1.5 rounded-full hover:bg-muted-100 dark:hover:bg-muted-800"
              aria-label="Details"
              title="Details"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {canUpdate && onUpdate && (
            <button
              onClick={onUpdate}
              className="p-1.5 rounded-full hover:bg-muted-100 dark:hover:bg-muted-800"
              aria-label="Edit"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-full hover:bg-muted-100 dark:hover:bg-muted-800"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
