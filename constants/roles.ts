export enum UserRole {
  User = "user",
  MidAdmin = "midadmin",
  Admin = "admin",
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.User]: "ユーザー",
  [UserRole.MidAdmin]: "中間管理者",
  [UserRole.Admin]: "管理者",
};
