import { db } from "@/libs/db";
import { UserRole } from "@/constants/roles";
import { type CreateInitialRegistrationUserParams } from "@/features/auth/types/initial-registration";

type UserRegistrationRow = {
  isRegistered: boolean;
};

type CreatedUserRow = {
  id: string;
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

export async function createInitialRegistrationUser({
  name,
  email,
  passwordHash,
  bankName,
  accountType,
  branchName,
  accountNumber,
  accountHolder,
}: CreateInitialRegistrationUserParams) {
  const result = await db.query<CreatedUserRow>(
    `
      insert into users (
        name,
        email,
        password_hash,
        role,
        bank_name,
        branch_name,
        account_type,
        account_number,
        account_holder,
        status,
        amount_invoice
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', '0')
      returning id
    `,
    [
      name,
      email,
      passwordHash,
      UserRole.User,
      bankName,
      branchName,
      accountType,
      accountNumber,
      accountHolder,
    ],
  );

  return result.rows[0];
}
