import { db } from "@/libs/db";

type UserRegistrationRow = {
  isRegistered: boolean;
};

export async function existsUserByEmail(email: string) {
  const result = await db.query<UserRegistrationRow>(
    `
      select exists(
        select 1
        from users
        where lower(email) = lower($1)
          and deleted_at is null
      ) as "isRegistered"
    `,
    [email],
  );

  return result.rows[0]?.isRegistered ?? false;
}
