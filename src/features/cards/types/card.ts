export type CardId = string;

export interface ImageField {
  url: string;
  alt?: string;
}

export interface AddressField {
  street?: string;
  houseNumber?: string | number;
  state?: string;
  city?: string;
  country?: string;
  zip?: number;
}

export interface CardApi {
  _id: CardId;
  title: string;
  subtitle?: string;
  description?: string;
  image?: ImageField;
  phone?: string;
  email?: string;
  web?: string;
  address?: AddressField;
  bizNumber?: number;
  likes?: string[];
  createdAt?: string;
  updatedAt?: string;
  user_id?: string;
}

export interface CreateCardDto {
  title: string;
  subtitle: string;
  description: string;
  image: { url: string; alt: string };
  email: string;
  web: string;
  phone: string;
  address: {
    state?: string;
    country: string;
    city: string;
    street: string;
    houseNumber: number;
    zip?: number;
  };
  bizNumber?: number; // server-generated
}

export interface Card {
  id: CardId;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  phone?: string;
  addressText?: string;
  bizNumber?: number;
  likesCount: number;
  isFavorite?: boolean;
  ownerId?: string; // <-- for permissions
}

export interface CardsQuery {
  page?: number;
  limit?: number;
  q?: string;
}

export interface CardsPage<T = Card> {
  items: T[];
  page: number;
  limit: number;
  total?: number;
  hasMore?: boolean;
}
