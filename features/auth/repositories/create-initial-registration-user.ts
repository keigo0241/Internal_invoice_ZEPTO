import { UserRole } from "@/constants/roles";
import { type CreateInitialRegistrationUserParams } from "@/features/auth/types/initial-registration";
import { db } from "@/libs/db";

type CreatedUserRow = {
  id: string;
};

export async function createInitialRegistrationUser({
  name,
  email,
  passwordHash,
  address,
  phoneNumber,
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
        address,
        phone_number,
        role,
        bank_name,
        branch_name,
        account_type,
        account_number,
        account_holder,
        status,
        amount_invoice
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', '0')
      returning id
    `,
    [
      name,
      email,
      passwordHash,
      address,
      phoneNumber,
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
