import Image from "next/image";
import Link from "next/link";

type UserRole = "user" | "midadmin" | "admin";

const menuItems = [
  { label: "ダッシュボード", href: "/dashboard", icon: "/icons/dashboard.png", roles: ["user", "midadmin", "admin"] },
  { label: "請求書一覧", href: "/invoices", icon: "/icons/invoices.png", roles: ["user", "midadmin", "admin"], hasBorder: true },
  { label: "下書き一覧", href: "/invoices/drafts", icon: "/icons/drafts.png", roles: ["user", "midadmin"] },
  { label: "差戻一覧", href: "/approvals/returned", icon: "/icons/returned.png", roles: ["user", "midadmin"] },
  { label: "ユーザー一覧", href: "/users", icon: "/icons/users.png", roles: ["midadmin", "admin"], hasBorder: true },
  { label: "ユーザー情報", href: "/profile", icon: "/icons/profile.png", roles: ["user", "midadmin", "admin"],borderRoles: ["user"], },
  { label: "申請一覧", href: "/requests", icon: "/icons/requests.png", roles: ["midadmin", "admin"], hasBorder: true },
];

const currentUserRole: UserRole = "midadmin";

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
            <div key={item.href}>

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