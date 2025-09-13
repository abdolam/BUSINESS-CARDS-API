import type { Role } from "@/types/roles";

/** Pair of IDs to check resource ownership */
export type Ownership = {
  ownerId?: string;
  currentUserId?: string;
};

/** Is the current user authenticated (any non-guest role)? */
export const isAuthenticated = (role: Role | null | undefined): boolean =>
  role !== null && role !== undefined && role !== "guest";

/** Basic ownership check (safe on partial data) */
export const isOwner = ({ ownerId, currentUserId }: Ownership): boolean =>
  !!ownerId && !!currentUserId && ownerId === currentUserId;

/** Everyone can initiate a call (even guests) */
export const canCallOwner = (): boolean => true;

/** View “details” actions on cards (hide from guests) */
export const canViewCardDetails = (role: Role | null | undefined): boolean =>
  isAuthenticated(role);

/** Heart/like action (all logged-in roles) */
export const canLikeCard = (role: Role | null | undefined): boolean =>
  isAuthenticated(role);

/** Favorite/unfavorite (alias to like-permission for clarity in UI/pages) */
export const canFavoriteCard = (role: Role | null | undefined): boolean =>
  canLikeCard(role);

/** Create new card (Business or Admin) */
export const canCreateCard = (role: Role | null | undefined): boolean =>
  role === "business" || role === "admin";

/** See “My Cards” page (Business or Admin) */
export const canViewMyCards = (role: Role | null | undefined): boolean =>
  role === "business" || role === "admin";

/** Update a card (Admin or Business owner) */
export const canUpdateCard = (
  role: Role | null | undefined,
  o: Ownership
): boolean => role === "admin" || (role === "business" && isOwner(o));

/** Delete a card (Admin or Business owner) */
export const canDeleteCard = (
  role: Role | null | undefined,
  o: Ownership
): boolean => role === "admin" || (role === "business" && isOwner(o));

/** Access CRM page (Admin only) */
export const canSeeCRM = (role: Role | null | undefined): boolean =>
  role === "admin";

/** Access admin dashboard/tools (Admin only) */
export const canAccessAdmin = (role: Role | null | undefined): boolean =>
  role === "admin";

/** Manage own account/profile (any authenticated user) */
export const canManageOwnAccount = (role: Role | null | undefined): boolean =>
  isAuthenticated(role);
