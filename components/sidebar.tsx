import Image from "next/image";
import Link from "next/link";
import { USER_ROLES, type UserRole } from "@/constants/roles";

const menuItems = [
  { id: "dashboard", label: "ダッシュボード", href: "/dashboard", roles: ["user", "midadmin", "admin"] },
  { id: "invoice-list", label: "請求書一覧", href: "/invoices", roles: ["user", "midadmin", "admin"], hasBorder: true },
  { id: "draft-list", label: "下書き一覧", href: "/invoices?status=draft", roles: ["user", "midadmin"] },
  { id: "returned-list", label: "差戻一覧", href: "/invoices?status=returned", roles: ["user", "midadmin"] },
  { id: "users-list", label: "ユーザー一覧", href: "/users", roles: ["midadmin", "admin"], hasBorder: true },
  { id: "user-profile", label: "ユーザー情報", href: "/profile", roles: ["user", "midadmin", "admin"], borderRoles: ["user"] },
  { id: "requests-list", label: "申請一覧", href: "/requests", roles: ["midadmin", "admin"], hasBorder: true },
];

const currentUserRole: UserRole = USER_ROLES.USER;

export function AppSidebar() {
  return (
    <aside className="h-screen w-50 bg-sky-800 p-4 text-white">
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/icons/zeptologo.png"
          alt="logo"
          width={40}
          height={40}
          className="rounded-md"
        />

        <h1 className="text-base font-bold">
          社内請求書App
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
          {menuItems.filter((item) => item.roles.includes(currentUserRole)).map((item) => (
            <div key={item.id}>

              {(item.hasBorder ||
                item.borderRoles?.includes(currentUserRole)) && (
                <div className="mx-2 my-2 border-b border-white/30" />
              )}

              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-md py-1 px-4 text-base font-medium transition hover:bg-sky-700"
              >

                <span className="whitespace-nowrap">
                  {item.label}
                </span>
              </Link>

            </div>
          ))}
        </nav>
    </aside>
  );
}