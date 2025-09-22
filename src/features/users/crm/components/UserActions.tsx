import TableBtn from "./TableBtn";
import { useCrmMutations, type CRMUser } from "../hooks/useCrmMutations";

type Props = { user: CRMUser; onRequestDelete?: () => void };

export default function UserActions({ user, onRequestDelete }: Props) {
  const { toggleBusiness, toggleBlock } = useCrmMutations();

  const admin = !!user.isAdmin;
  const blocked = !!user.isBlocked;

  return (
    <div className="flex gap-2 justify-center">
      {/* חסום / בטל חסימה */}
      <TableBtn
        className={
          blocked
            ? "w-24 text-nowrap border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            : "w-24 text-nowrap border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
        }
        onClick={() => toggleBlock.mutate(user)}
        disabled={admin || toggleBlock.isPending}
        title={
          admin
            ? "אין אפשרות לחסום אדמין"
            : blocked
            ? "בטל חסימה"
            : "חסום משתמש"
        }
      >
        {blocked ? "בטל חסימה" : "חסום"}
      </TableBtn>

      {/* סטטוס עסקי */}
      <TableBtn
        onClick={() => toggleBusiness.mutate(user)}
        disabled={admin || toggleBusiness.isPending}
        title={admin ? "אין אפשרות להחליף סטטוס לאדמין" : "החלף סטטוס עסקי"}
      >
        סטטוס
      </TableBtn>

      {/* מחק → דרך הדיאלוג של העמוד */}
      <TableBtn
        className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={onRequestDelete}
        disabled={admin}
        title={admin ? "אי אפשר למחוק משתמש אדמין" : "מחק משתמש"}
      >
        מחק
      </TableBtn>
    </div>
  );
}
