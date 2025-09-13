import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import useAuth from "@/features/users/auth/useAuth";
import type { User } from "@/types/user";
import {
  getAllUsers,
  deleteUser as deleteUserApi,
} from "@/features/users/services/userService";
import DeleteUserDialog from "@/features/users/crm/components/DeleteUserDialog";
import Main from "@/components/layout/Main";
import {
  CsvButton,
  ContactIcons,
  UserActions,
  UserRoleBadge,
  UserOnlineBadge,
  UserBlockedBadge,
  type CRMUser,
} from "@/features/users/crm";

type ExtUser = CRMUser & User;

export default function CrmPage() {
  const { isAdmin } = useAuth();

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery<ExtUser[]>({
    queryKey: ["crm-users"],
    queryFn: getAllUsers as () => Promise<ExtUser[]>,
    staleTime: 60_000,
  });

  const rows = useMemo(
    () =>
      users
        .slice()
        .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? "")),
    [users]
  );

  const qc = useQueryClient();
  const [delUser, setDelUser] = useState<ExtUser | null>(null);

  const openDelete = (u: ExtUser) => setDelUser(u);
  const closeDelete = () => setDelUser(null);
  const verifyAdminPassword = async () => {
    return true;
  };

  const performDelete = async () => {
    if (!delUser) return;
    await deleteUserApi(delUser._id);
    await qc.invalidateQueries({ queryKey: ["crm-users"] });
  };

  const isOtherAdmin = (u: ExtUser) => !!u.isAdmin;

  if (!isAdmin) {
    return (
      <Main>
        <div dir="rtl" className="max-w-6xl mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-semibold mb-4">CRM</h1>
          <div className="rounded-lg border p-4 text-red-600 dark:text-red-400">
            אין לך הרשאה לצפות בעמוד זה.
          </div>
        </div>
      </Main>
    );
  }

  return (
    <Main>
      <div dir="rtl" className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold">CRM</h1>
          <p className="text-sm text-muted-600 dark:text-muted-300 mt-1">
            ניהול משתמשים — הרשאות, חיבור, חסימה ויצירת קשר.
          </p>
        </header>

        <div className="mt-6">
          <div className="mb-2 flex justify-end ltr:justify-start">
            <CsvButton rows={rows} filename="users.csv" showLabel={true} />
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full text-sm border-collapse text-center">
              <thead className="bg-muted-100 dark:bg-muted-800">
                <tr className="text-muted-700 dark:text-muted-200">
                  <th className="p-3 font-semibold">שם</th>
                  <th className="p-3 font-semibold">דוא״ל</th>
                  <th className="p-3 font-semibold">טלפון</th>
                  <th className="p-3 font-semibold">צור קשר</th>
                  <th className="p-3 font-semibold">הרשאה</th>
                  <th className="p-3 font-semibold">חיבור</th>
                  <th className="p-3 font-semibold">חסום</th>
                  <th className="p-3 font-semibold">פעולות</th>
                </tr>
              </thead>

              <tbody className="[&_tr:hover]:bg-muted-50/50 dark:[&_tr:hover]:bg-muted-800/30">
                {rows.map((u) => {
                  const admin = isOtherAdmin(u);
                  const blocked = !!u.isBlocked;
                  const online = !!u.isOnline;
                  const biz = !!u.isBusiness;
                  const idShort = (u._id ?? "").toString().slice(0, 6);

                  return (
                    <tr key={u._id} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">
                          {u.name?.first} {u.name?.last}
                        </div>
                        <div className="text-xs text-muted-500">
                          מזהה: {idShort}…
                        </div>
                      </td>

                      <td className="p-3" dir="ltr">
                        <div className="mx-auto w-[160px] sm:w-[200px] md:w-[240px] truncate">
                          {u.email}
                        </div>
                      </td>

                      <td className="p-3" dir="ltr">
                        {u.phone ?? "—"}
                      </td>

                      <td className="p-3">
                        <ContactIcons email={u.email} phone={u.phone} />
                      </td>

                      <td className="p-3">
                        <UserRoleBadge admin={admin} business={biz} />
                      </td>

                      <td className="p-3">
                        <UserOnlineBadge online={online} />
                      </td>

                      <td className="p-3">
                        <UserBlockedBadge blocked={blocked} />
                      </td>

                      <td className="p-3">
                        <UserActions
                          user={u}
                          onRequestDelete={() => openDelete(u)}
                        />
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && !isLoading && (
                  <tr>
                    <td className="p-4 text-center text-muted-500" colSpan={8}>
                      אין נתונים להצגה.
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td
                      className="p-4 text-center text-red-600 dark:text-red-400"
                      colSpan={8}
                    >
                      טעינת משתמשים נכשלה.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DeleteUserDialog
            open={!!delUser}
            userEmail={delUser?.email ?? ""}
            onClose={closeDelete}
            onVerifyPassword={verifyAdminPassword}
            onConfirmDelete={performDelete}
          />
        </div>
      </div>
    </Main>
  );
}
