import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useAuth from "@/features/users/auth/useAuth";
import { getCurrentUserIdFromStorage } from "@/features/users/auth/helpers";
import type { User } from "@/types/user";
import {
  getAllUsers,
  deleteUser as deleteUserApi,
} from "@/features/users/services/userService";
import { usersApi } from "@/services/http";
import DeleteUserDialog from "@/features/users/crm/components/DeleteUserDialog";
import Main from "@/components/layout/Main";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import Pagination from "@/features/cards/components/Pagination";
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
const PAGE_SIZES = [10, 20, 50];

export default function CrmPage() {
  const { isAdmin } = useAuth();
  const meId = getCurrentUserIdFromStorage() ?? "";
  const [sp, setSp] = useSearchParams();

  // URL state
  const page = clampInt(sp.get("page") ?? "1", 1);
  const limit = clampToSet(sp.get("limit") ?? "20", PAGE_SIZES, 20);
  const q = sp.get("q") ?? "";
  const role = (sp.get("role") ?? "all") as
    | "all"
    | "admin"
    | "business"
    | "regular";
  const blocked = (sp.get("blocked") ?? "all") as "all" | "yes" | "no";
  const online = (sp.get("online") ?? "all") as "all" | "yes" | "no";

  const {
    data: users = [],
    isLoading,
    fetchStatus,
    error,
  } = useQuery<ExtUser[]>({
    queryKey: ["crm-users"],
    queryFn: getAllUsers as () => Promise<ExtUser[]>,
    staleTime: 60_000,
  });
  const isFetching = fetchStatus === "fetching";

  const hasOnline = users.some((u) => "isOnline" in u);
  const hasBlocked = users.some((u) => "isBlocked" in u);

  // Filter + search (client-side for now)
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users
      .slice()
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""))
      .filter((u) => {
        if (role !== "all") {
          const r = u.isAdmin ? "admin" : u.isBusiness ? "business" : "regular";
          if (r !== role) return false;
        }
        if (blocked !== "all")
          if ((blocked === "yes") !== !!u.isBlocked) return false;
        if (online !== "all")
          if ((online === "yes") !== !!u.isOnline) return false;
        if (!needle) return true;
        const name = `${u.name?.first ?? ""} ${
          u.name?.last ?? ""
        }`.toLowerCase();
        return (
          name.includes(needle) ||
          (u.email ?? "").toLowerCase().includes(needle) ||
          (u.phone ?? "").toLowerCase().includes(needle)
        );
      });
  }, [users, q, role, blocked, online]);

  // Totals
  const totals = useMemo(() => {
    let admin = 0,
      business = 0,
      regular = 0,
      active = 0,
      blockedCnt = 0;
    for (const u of users) {
      if (u.isAdmin) admin++;
      else if (u.isBusiness) business++;
      else regular++;
      if (u.isOnline) active++;
      if (u.isBlocked) blockedCnt++;
    }
    return {
      users: users.length,
      admin,
      business,
      regular,
      active,
      blocked: blockedCnt,
    };
  }, [users]);

  // Pagination window
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSafe = Math.min(page, totalPages);
  const offset = (pageSafe - 1) * limit;
  const rows = filtered.slice(offset, offset + limit);

  const qc = useQueryClient();
  const [delUser, setDelUser] = useState<ExtUser | null>(null);

  const sync = (next: Partial<Record<string, string>>) => {
    const n = new URLSearchParams(sp);
    Object.entries(next).forEach(([k, v]) =>
      v && v !== "" ? n.set(k, v) : n.delete(k)
    );
    setSp(n, { replace: true });
  };

  const openDelete = (u: ExtUser) => {
    if (u._id === meId || u.isAdmin) return; // guard self/admin
    setDelUser(u);
  };
  const closeDelete = () => setDelUser(null);
  const adminEmail = users.find((u) => u._id === meId)?.email ?? ""; // fallback if useAuth.user missing
  const verifyAdminPassword = async (password: string) => {
    if (!adminEmail || !password) return false;
    try {
      await usersApi.post(
        "/users/login",
        { email: adminEmail, password },
        { headers: { "x-local-error": "1" } } // avoid global error bridge
      );
      return true; // password correct
    } catch {
      return false; // wrong password
    }
  };
  const performDelete = async () => {
    if (!delUser) return;
    if (delUser._id === meId || delUser.isAdmin) return;
    await deleteUserApi(delUser._id);
    await qc.invalidateQueries({ queryKey: ["crm-users"] });
  };

  useEffect(() => {
    if (pageSafe !== page) sync({ page: String(pageSafe) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSafe]);

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
      <LoadingOverlay open={isLoading || isFetching} />
      <div dir="rtl" className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold">CRM</h1>
          <p className="text-sm text-muted-600 dark:text-muted-300 mt-1">
            ניהול משתמשים — הרשאות, חיבור, חסימה ויצירת קשר.
          </p>
        </header>

        {/* Totals */}
        <section className="my-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            ["סה״כ", totals.users],
            ["אדמין", totals.admin],
            ["עסקי", totals.business],
            ["רגיל", totals.regular],
            ["מחוברים", totals.active],
            ["חסומים", totals.blocked],
          ].map(([label, val]) => (
            <div
              key={label as string}
              className="rounded-xl border p-2 text-center  bg-gray-50  dark:bg-muted-900"
            >
              <div className="text-xs text-muted-500">{label}</div>
              <div className="text-xl font-semibold">{val as number}</div>
            </div>
          ))}
        </section>

        {/* Controls row: left=filters/search, right=lines-per-page (top-right) */}
        <section className="my-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              className="h-10 px-3  dark:bg-muted-900 focus:outline-none "
              value={role}
              onChange={(e) => sync({ role: e.target.value, page: "1" })}
            >
              <option value="all">כל התפקידים</option>
              <option value="admin">אדמין</option>
              <option value="business">עסקי</option>
              <option value="regular">רגיל</option>
            </select>
            <select
              className="h-10 px-3  dark:bg-muted-900 focus:outline-none "
              value={blocked}
              onChange={(e) => sync({ blocked: e.target.value, page: "1" })}
            >
              <option value="all">חסימה: הכל</option>
              <option value="yes">חסום</option>
              <option value="no">לא חסום</option>
            </select>
            <select
              className="h-10 px-3  dark:bg-muted-900  focus:outline-none "
              value={online}
              onChange={(e) => sync({ online: e.target.value, page: "1" })}
            >
              <option value="all">חיבור: הכל</option>
              <option value="yes">מחובר</option>
              <option value="no">מנותק</option>
            </select>
            <div className="relative mr-10">
              <input
                className="h-10 w-56 sm:w-72 pr-10 pl-4  dark:bg-muted-900 border-b-2  focus:outline-none "
                placeholder='חפש שם, טלפון או דוא"ל'
                value={q}
                onChange={(e) => sync({ q: e.target.value, page: "1" })}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-muted-400">
                ⌕
              </span>
            </div>
          </div>

          {/* Right side — Lines per page (top-right) */}
          <div className="flex items-center gap-10 self-end sm:self-auto">
            <CsvButton rows={filtered} filename="users.csv" showLabel />
            <div>
              <span className="text-sm text-muted-600 dark:text-muted-300">
                שורות בעמוד:
              </span>
              <select
                className="h-9 px-3  dark:bg-muted-900  focus:outline-none "
                value={limit}
                onChange={(e) => sync({ limit: e.target.value, page: "1" })}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Table */}
        <div className="mt-3 overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm text-center border-x">
            <thead className="bg-muted-100 dark:bg-muted-800  ">
              <tr className="text-muted-700 dark:text-muted-200 ">
                <th className="font-semibold align-middle">
                  <div className="th-wrap no-vline">#</div>
                </th>
                <th className="font-semibold align-middle ">
                  <div className="th-wrap no-vline">שם</div>
                </th>
                <th className="font-semibold align-middle">
                  <div className="th-wrap no-vline ">דוא״ל</div>
                </th>
                <th className=" font-semibold align-middle ">
                  <div className="th-wrap no-vline">טלפון</div>
                </th>
                <th className=" font-semibold align-middle ">
                  <div className="th-wrap no-vline">צור קשר</div>
                </th>
                <th className=" font-semibold align-middle ">
                  <div className="th-wrap no-vline">הרשאה</div>
                </th>
                {hasOnline && (
                  <th className="font-semibold align-middle ">
                    <div className="th-wrap no-vline">חיבור</div>
                  </th>
                )}
                {hasBlocked && (
                  <th className="font-semibold align-middle ">
                    <div className="th-wrap no-vline">חסום</div>
                  </th>
                )}
                <th className=" font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="[&_tr:hover]:bg-muted-50/50 dark:[&_tr:hover]:bg-muted-800/30">
              {rows.map((u, i) => {
                const admin = !!u.isAdmin,
                  blockedB = !!u.isBlocked,
                  onlineB = !!u.isOnline,
                  biz = !!u.isBusiness;
                const idShort = (u._id ?? "").toString().slice(0, 6);
                const rowNo = offset + i + 1;
                const canDelete = !admin && u._id !== meId;
                return (
                  <tr key={u._id} className="border-t">
                    <td className="p-2">{rowNo}</td>
                    <td className="p-2">
                      <div className="font-medium">
                        {u.name?.first} {u.name?.last}
                      </div>
                      <div className="text-xs text-muted-500">
                        מזהה: {idShort}…
                      </div>
                    </td>
                    <td className="p-2" dir="ltr">
                      <div className="mx-auto w-fit sm:w-[200px] md:w-[240px] truncate">
                        {u.email}
                      </div>
                    </td>
                    <td className="p-2 w-fit" dir="ltr">
                      {u.phone ?? "—"}
                    </td>
                    <td className="p-2">
                      <ContactIcons email={u.email} phone={u.phone} />
                    </td>
                    <td className="p-2">
                      <UserRoleBadge admin={admin} business={biz} />
                    </td>
                    {hasOnline && (
                      <td className="p-2">
                        <UserOnlineBadge online={onlineB} />
                      </td>
                    )}
                    {hasBlocked && (
                      <td className="p-2">
                        <UserBlockedBadge blocked={blockedB} />
                      </td>
                    )}
                    <td className="p-2">
                      <UserActions
                        user={u}
                        onRequestDelete={() => openDelete(u)}
                        canDelete={canDelete}
                        canBlockAction={hasBlocked}
                      />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && !isLoading && (
                <tr>
                  <td
                    className="p-4 text-center text-muted-500"
                    colSpan={
                      6 + (hasOnline ? 1 : 0) + (hasBlocked ? 1 : 0)
                    } /* #, שם, דוא״ל, טלפון, צור קשר, הרשאה + optional + פעולות */
                  >
                    אין נתונים להצגה.
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td
                    className="p-4 text-center text-red-600 dark:text-red-400"
                    colSpan={9}
                  >
                    טעינת משתמשים נכשלה.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Centered Pagination */}
        <Pagination
          page={pageSafe}
          limit={limit}
          total={total}
          onPageChange={(p) => sync({ page: String(p) })}
          isLoadingPage={isFetching}
          className="mt-4"
          maxButtons={7}
        />

        <DeleteUserDialog
          open={!!delUser}
          userEmail={delUser?.email ?? ""}
          onClose={closeDelete}
          onVerifyPassword={verifyAdminPassword}
          onConfirmDelete={performDelete}
        />
      </div>
    </Main>
  );
}

function clampInt(v: string, min: number) {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= min ? n : min;
}
function clampToSet(v: string, set: number[], fallback: number) {
  const n = Number.parseInt(v, 10);
  return set.includes(n) ? n : fallback;
}
