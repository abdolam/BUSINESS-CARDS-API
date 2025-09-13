import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCardById } from "@/features/cards/api/cards";
import UiLink from "@/components/ui/UiLink";
import ContactList from "@/components/ui/ContactList";
import { ArrowRight } from "lucide-react";

export default function CardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: card,
    isLoading,
    isError,
  } = useQuery({
    enabled: !!id,
    queryKey: ["card", id],
    queryFn: () => fetchCardById(id!),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-6" dir="rtl">
        טוען…
      </main>
    );
  }
  if (isError || !card) {
    return (
      <main className="container mx-auto px-4 py-6" dir="rtl">
        לא נמצא כרטיס.
      </main>
    );
  }

  const address = card.addressText ?? "";
  const addressQ = encodeURIComponent(address);
  const gmapsNav = address
    ? `https://www.google.com/maps/search/?api=1&query=${addressQ}`
    : undefined;
  const wazeNav = address ? `https://waze.com/ul?q=${addressQ}` : undefined;
  const mapEmbedSrc = address
    ? `https://www.google.com/maps?q=${addressQ}&output=embed`
    : undefined;

  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <div className="mb-4">
        <Link
          to="/"
          className="flex flex-row-reverse items-center text-xs font-normal underline hover:text-blue-600 dark:hover:text-blue-400"
          dir="ltr"
        >
          <ArrowRight strokeWidth={1} size={12} /> חזרה
        </Link>
      </div>

      {/* Hero / header */}
      <section className="rounded-2xl overflow-hidden border border-muted-200 dark:border-muted-700">
        <div className="relative">
          <img
            src={card.imageUrl}
            alt={card.imageAlt}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 right-3 left-3 md:right-6 md:left-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow">
              {card.title}
            </h1>
            {card.subtitle && (
              <p className="text-sm md:text-base opacity-90">{card.subtitle}</p>
            )}
          </div>
        </div>

        {/* Info + actions */}
        <div className="p-4 md:p-6 grid gap-6 md:grid-cols-3">
          {/* Contact / meta */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold mb-3">יצירת קשר</h2>
            <ContactList
              email={undefined /* supply when available */}
              phone={card.phone}
              address={address || undefined}
              className="space-y-3"
            />

            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-4">
              {card.phone && (
                <UiLink href={`tel:${card.phone}`} ariaLabel="התקשר">
                  <img
                    src="/logos/phone.svg"
                    alt="התקשר"
                    className="w-8 h-8 rounded-full hover:scale-110 transition"
                  />
                </UiLink>
              )}

              {gmapsNav && (
                <UiLink href={gmapsNav} ariaLabel="ניווט עם Google Maps">
                  <img
                    src="/logos/google-maps.svg"
                    alt="Google Maps"
                    className="w-8 h-8 rounded-full hover:scale-110 transition"
                  />
                </UiLink>
              )}

              {wazeNav && (
                <UiLink href={wazeNav} ariaLabel="ניווט עם Waze">
                  <img
                    src="/logos/waze.svg"
                    alt="Waze"
                    className="w-8 h-8 rounded-full hover:scale-110 transition"
                  />
                </UiLink>
              )}
            </div>

            {/* Extra business meta */}
            <div className="mt-5 space-y-1 text-sm text-muted-700 dark:text-muted-300">
              {typeof card.bizNumber !== "undefined" && (
                <p>
                  <span className="font-medium">מס' כרטיס:</span>{" "}
                  {card.bizNumber}
                </p>
              )}
              {card.likesCount > 0 && (
                <p>
                  <span className="font-medium">לייקים:</span> {card.likesCount}
                </p>
              )}
            </div>
          </div>

          {/* Description + map */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {card.description && (
              <section>
                <h2 className="text-lg font-semibold mb-2">אודות</h2>
                <p className="text-muted-700 dark:text-muted-300 leading-relaxed">
                  {card.description}
                </p>
              </section>
            )}
            {/* Map */}
            {mapEmbedSrc ? (
              <section>
                <h2 className="text-lg font-semibold mb-2">מפה</h2>
                <div className="rounded-xl overflow-hidden border border-muted-200 dark:border-muted-700 aspect-video">
                  <iframe
                    title="Business location on map"
                    src={mapEmbedSrc}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </section>
            ) : (
              <section className="text-sm text-muted-500 dark:text-muted-400">
                לא צוינה כתובת לתצוגה במפה.
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
