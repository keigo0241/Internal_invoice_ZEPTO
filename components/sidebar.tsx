import Image from "next/image";
import Link from "next/link";
import { type UserRole } from "@/constants/roles";

type SidebarMenuItem = {
  id: string;
  label: string;
  href: string;
  roles: UserRole[];
  hasBorder?: boolean;
  borderRoles?: UserRole[];
};

const menuItems: SidebarMenuItem[] = [
  { id: "dashboard", label: "ダッシュボード", href: "/dashboard", roles: ["user", "midadmin", "admin"] },
  { id: "invoice-list", label: "請求書一覧", href: "/invoices", roles: ["user", "midadmin", "admin"], hasBorder: true },
  { id: "draft-list", label: "下書き一覧", href: "/invoices?status=draft", roles: ["user", "midadmin"] },
  { id: "returned-list", label: "差戻一覧", href: "/invoices?status=returned", roles: ["user", "midadmin"] },
  { id: "users-list", label: "ユーザー一覧", href: "/users", roles: ["midadmin", "admin"], hasBorder: true },
  { id: "user-profile", label: "ユーザー情報", href: "/profile", roles: ["user", "midadmin", "admin"], borderRoles: ["user"] },
  { id: "requests-list", label: "申請一覧", href: "/requests", roles: ["midadmin", "admin"], hasBorder: true },
];

type AppSidebarProps = {
  currentUserRole: UserRole;
  isOpen: boolean;
};

export function AppSidebar({ currentUserRole, isOpen }: AppSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={`h-screen shrink-0 overflow-hidden bg-sky-800 text-white transition-[width] duration-300 ease-in-out ${
        isOpen ? "w-50" : "w-0"
      }`}
    >
      <div
        className={`w-50 p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
      </div>
    </aside>
  );
}
