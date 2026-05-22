import { UserRole } from "@/constants/roles";

type PageId =
  | "dashboard"
  | "invoices"
  | "draftInvoices"
  | "returnedInvoices"
  | "users"
  | "profile"
  | "requests";

type PageDef = {
  id: PageId;
  label: string;
  href: string;
  hasBorder?: boolean;
  borderRoles?: UserRole[];
};

export const pageList = {
  dashboard: {
    id: "dashboard",
    label: "ダッシュボード",
    href: "/dashboard",
  },
  invoices: {
    id: "invoices",
    label: "請求書一覧",
    href: "/invoices",
    hasBorder: true,
  },
  draftInvoices: {
    id: "draftInvoices",
    label: "下書き一覧",
    href: "/invoices?status=draft",
  },
  returnedInvoices: {
    id: "returnedInvoices",
    label: "差戻一覧",
    href: "/invoices?status=returned",
  },
  users: {
    id: "users",
    label: "ユーザー一覧",
    href: "/users",
    hasBorder: true,
  },
  profile: {
    id: "profile",
    label: "ユーザー情報",
    href: "/profile",
    borderRoles: [UserRole.User],
  },
  requests: {
    id: "requests",
    label: "申請一覧",
    href: "/requests",
    hasBorder: true,
  },
} as const satisfies Record<PageId, PageDef>;

export const sidebarByRole = {
  [UserRole.User]: [
    pageList.dashboard,
    pageList.invoices,
    pageList.draftInvoices,
    pageList.returnedInvoices,
    pageList.profile,
  ],
  [UserRole.MidAdmin]: [
    pageList.dashboard,
    pageList.invoices,
    pageList.draftInvoices,
    pageList.returnedInvoices,
    pageList.users,
    pageList.profile,
    pageList.requests,
  ],
  [UserRole.Admin]: [
    pageList.dashboard,
    pageList.invoices,
    pageList.users,
    pageList.profile,
    pageList.requests,
  ],
} as const satisfies Record<UserRole, readonly PageDef[]>;

type PageTitlePath =
  | typeof pageList.dashboard.href
  | typeof pageList.users.href
  | typeof pageList.profile.href
  | typeof pageList.requests.href;

const DEFAULT_PAGE_TITLE = pageList.dashboard.label;
const INVOICE_PAGE_TITLE = pageList.invoices.label;

const PAGE_TITLE_MAP = {
  [pageList.dashboard.href]: pageList.dashboard.label,
  [pageList.users.href]: pageList.users.label,
  [pageList.profile.href]: pageList.profile.label,
  [pageList.requests.href]: pageList.requests.label,
} as const satisfies Record<PageTitlePath, string>;

function isPageTitlePath(pathname: string): pathname is PageTitlePath {
  return pathname in PAGE_TITLE_MAP;
}

export function getPageTitle(pathname: string) {
  if (pathname === pageList.invoices.href) {
    return INVOICE_PAGE_TITLE;
  }

  return isPageTitlePath(pathname) ? PAGE_TITLE_MAP[pathname] : DEFAULT_PAGE_TITLE;
}

export function getDefaultPageTitle() {
  return DEFAULT_PAGE_TITLE;
}

export type { PageDef };
