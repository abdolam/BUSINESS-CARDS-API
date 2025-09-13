import { cardsApi as api } from "@/services/http";
import type { Card, CardApi, CardsPage, CreateCardDto } from "../types/card";
import { getCurrentUserIdFromStorage } from "@/features/users/auth/helpers";
import { DEFAULT_CARD_IMAGE_URL } from "../utils/image";

export function mapCard(d: CardApi, currentUserId?: string): Card {
  const likes = Array.isArray(d.likes) ? d.likes : [];
  return {
    id: d._id,
    title: d.title,
    subtitle: d.subtitle ?? "",
    description: d.description ?? "",
    imageUrl: d.image?.url ?? DEFAULT_CARD_IMAGE_URL, // ← updated
    imageAlt: d.image?.alt ?? d.title ?? "card image",
    phone: d.phone,
    addressText: [
      d.address?.street,
      d.address?.houseNumber,
      d.address?.city,
      d.address?.country,
    ]
      .filter(Boolean)
      .join(", "),
    bizNumber: d.bizNumber,
    likesCount: likes.length,
    isFavorite: currentUserId ? likes.includes(currentUserId) : undefined,
    ownerId: d.user_id,
  };
}

export async function fetchCards(currentUserId?: string): Promise<Card[]> {
  const { data } = await api.get<CardApi[]>("/cards", {
    headers: { "x-local-error": "1" },
  });
  return data.map((d) => mapCard(d, currentUserId));
}

export type GetCardsParams = { page?: number; limit?: number; q?: string };

type PagedApiShape =
  | CardApi[]
  | {
      data?: CardApi[];
      items?: CardApi[];
      total?: number;
      count?: number;
      page?: number;
      limit?: number;
    };

function compactParams<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  ) as Partial<T>;
}

function filterByQuery(cards: Card[], q?: string): Card[] {
  if (!q) return cards;
  const tokens = q
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return cards;
  const hay = (c: Card) =>
    [c.title, c.subtitle, c.description, c.addressText, c.phone]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  return cards.filter((c) => {
    const h = hay(c);
    return tokens.some((t) => h.includes(t));
  });
}

export async function fetchCardsPaged(
  { page = 1, limit = 12, q = "" }: GetCardsParams,
  currentUserId?: string
): Promise<CardsPage> {
  const params = compactParams({ page, limit, q });
  const normalize = (rows: CardApi[]) =>
    filterByQuery(
      rows.map((d) => mapCard(d, currentUserId)),
      q
    );
  const slicePage = (all: Card[]) => {
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);
    const total = all.length;
    return { items, page, limit, total, hasMore: page * limit < total };
  };

  const { data } = await api.get<PagedApiShape>("/cards", {
    params,
    headers: { "x-local-error": "1" },
  });

  if (Array.isArray(data)) {
    const all = normalize(data);
    return slicePage(all);
  }

  const raw = (data.items ?? data.data ?? []) as CardApi[];
  const totalFromServer = (data.total ?? data.count) as number | undefined;

  if (!totalFromServer) {
    const all = normalize(raw);
    return slicePage(all);
  }

  const items = normalize(raw);
  const resolvedPage = Number(data.page ?? page);
  const resolvedLimit = Number(data.limit ?? limit);
  return {
    items,
    page: resolvedPage,
    limit: resolvedLimit,
    total: totalFromServer,
    hasMore: resolvedPage * resolvedLimit < totalFromServer,
  };
}

export async function createCard(payload: CreateCardDto): Promise<Card> {
  const { data } = await api.post<CardApi>("/cards", payload, {
    headers: { "x-local-error": "1" },
  });
  return mapCard(data);
}

export async function fetchCardById(id: string): Promise<Card> {
  const currentUserId = getCurrentUserIdFromStorage();
  const { data } = await api.get<CardApi>(`/cards/${id}`, {
    headers: { "x-local-error": "1" },
  });
  return mapCard(data, currentUserId);
}

export async function fetchCardApiById(id: string): Promise<CardApi> {
  const { data } = await api.get<CardApi>(`/cards/${id}`, {
    headers: { "x-local-error": "1" },
  });
  return data;
}

export function toCreateDtoFromApi(d: CardApi): CreateCardDto {
  return {
    title: d.title ?? "",
    subtitle: d.subtitle ?? "",
    description: d.description ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",
    web: d.web ?? "",
    image: {
      url: d.image?.url ?? "/logo.png",
      alt: d.image?.alt ?? d.title ?? "card image",
    },
    address: {
      state: d.address?.state ?? "",
      country: d.address?.country ?? "",
      city: d.address?.city ?? "",
      street: d.address?.street ?? "",
      houseNumber:
        typeof d.address?.houseNumber === "string"
          ? Number(d.address?.houseNumber) || 1
          : (d.address?.houseNumber as number) ?? 1,
      zip: d.address?.zip,
    },
    bizNumber: d.bizNumber,
  };
}

export async function updateCard(
  id: string,
  payload: Partial<CreateCardDto>
): Promise<Card> {
  const { data } = await api.put<CardApi>(`/cards/${id}`, payload, {
    headers: { "x-local-error": "1" },
  });
  const currentUserId = getCurrentUserIdFromStorage();
  return mapCard(data, currentUserId);
}

export async function deleteCard(id: string): Promise<void> {
  await api.delete(`/cards/${id}`, { headers: { "x-local-error": "1" } });
}

export async function toggleLike(cardId: string): Promise<void> {
  await api.patch(
    `/cards/${encodeURIComponent(cardId)}`,
    {}, // server toggles like based on auth user; empty body is fine
    { headers: { "x-local-error": "1" } }
  );
}

export default {
  mapCard,
  fetchCards,
  fetchCardsPaged,
  createCard,
  fetchCardById,
  fetchCardApiById,
  toCreateDtoFromApi,
  updateCard,
  deleteCard,
  toggleLike,
};
