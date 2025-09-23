import TableBtn from "./TableBtn";
import { useCrmMutations, type CRMUser } from "../hooks/useCrmMutations";

type Props = {
  user: CRMUser;
  onRequestDelete?: () => void;
  canDelete?: boolean;
  canBlockAction?: boolean;
};

export default function UserActions({
  user,
  onRequestDelete,
  canDelete = true,
  canBlockAction = true,
}: Props) {
  const { toggleBusiness, toggleBlock } = useCrmMutations();
  const admin = !!user.isAdmin;
  const blocked = !!user.isBlocked;

  return (
    <div className="flex gap-2 justify-center">
      {canBlockAction && (
        <TableBtn
          className={
            blocked
              ? "w-fit text-nowrap border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              : "w-fit text-nowrap border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-600/50"
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
      )}
      ...
      <TableBtn
        className="w-fit text-indigo-700 dark:text-indigo-300 hover:dark:bg-indigo-600/50 border-indigo-200 hover:bg-indigo-50 "
        onClick={() => toggleBusiness.mutate(user)}
        disabled={admin || toggleBusiness.isPending}
        title={admin ? "אין אפשרות להחליף סטטוס לאדמין" : "החלף סטטוס עסקי"}
      >
        סטטוס
      </TableBtn>
      <TableBtn
        className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={onRequestDelete}
        disabled={admin || !canDelete}
        title={
          admin
            ? "אי אפשר למחוק משתמש אדמין"
            : !canDelete
            ? "אי אפשר למחוק את עצמך"
            : "מחק משתמש"
        }
      >
        מחק
      </TableBtn>
    </div>
  );
}
