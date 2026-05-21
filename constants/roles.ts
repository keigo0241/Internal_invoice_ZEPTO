export const USER_ROLES = {
  USER: "user",
  MIDADMIN: "midadmin",
  ADMIN: "admin",
} as const;

export type UserRole =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.USER]: "ユーザー",
  [USER_ROLES.MIDADMIN]: "中間管理者",
  [USER_ROLES.ADMIN]: "管理者",
};
