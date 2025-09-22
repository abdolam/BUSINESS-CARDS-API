import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/user";
import {
  updateUser,
  deleteUser as deleteUserApi,
} from "@/features/users/services/userService";

export type CRMUser = User & {
  isBusiness?: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  isOnline?: boolean;
  phone?: string;
};

type Patch = Record<string, unknown>;
const patchUser = (id: string, patch: Patch) =>
  updateUser(id, patch as unknown as Partial<User>);
const isOtherAdmin = (u: CRMUser) => !!u.isAdmin;

export function useCrmMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["crm-users"] });

  const toggleBusiness = useMutation({
    mutationFn: (u: CRMUser) => {
      if (isOtherAdmin(u)) throw new Error("אין אפשרות לשנות סטטוס לאדמין");
      return patchUser(u._id, { isBusiness: !u.isBusiness });
    },
    onSuccess: invalidate,
  });

  const toggleBlock = useMutation({
    mutationFn: (u: CRMUser) => {
      if (isOtherAdmin(u))
        throw new Error("אין אפשרות לחסום/לבטל חסימה לאדמין");
      return patchUser(u._id, { isBlocked: !u.isBlocked });
    },
    onSuccess: invalidate,
  });

  const removeUser = useMutation({
    mutationFn: async (u: CRMUser) => {
      if (isOtherAdmin(u)) throw new Error("אי אפשר למחוק משתמש אדמין");
      await deleteUserApi(u._id);
    },
    onSuccess: invalidate,
  });

  return { toggleBusiness, toggleBlock, removeUser };
}
