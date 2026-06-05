import zenginCode from "zengin-code";
import {
  type BankBranchOption,
  type BankOption,
} from "@/features/banks/types/bank";

const BANK_SEARCH_LIMIT = 20;
const BRANCH_SEARCH_LIMIT = 50;

function matchesKeyword(
  option: Pick<BankOption, "code" | "name" | "kana">,
  keyword: string,
) {
  if (!keyword) {
    return true;
  }

  return (
    option.code.toLowerCase().includes(keyword) ||
    option.name.toLowerCase().includes(keyword) ||
    option.kana.toLowerCase().includes(keyword)
  );
}

export function searchBanks(keyword: string): BankOption[] {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return Object.values(zenginCode)
    .map((bank) => ({
      code: bank.code,
      name: bank.name,
      kana: bank.kana,
    }))
    .filter((bank) => matchesKeyword(bank, normalizedKeyword))
    .slice(0, BANK_SEARCH_LIMIT);
}

export function searchBankBranches(
  bankCode: string,
  keyword: string,
): BankBranchOption[] {
  const bank = zenginCode[bankCode];

  if (!bank) {
    return [];
  }

  const normalizedKeyword = keyword.trim().toLowerCase();

  return Object.values(bank.branches)
    .map((branch) => ({
      code: branch.code,
      name: branch.name,
      kana: branch.kana,
    }))
    .filter((branch) => matchesKeyword(branch, normalizedKeyword))
    .slice(0, BRANCH_SEARCH_LIMIT);
}

export function isValidBankNameByCode(bankCode: string, bankName: string) {
  const bank = zenginCode[bankCode];

  return bank?.name === bankName;
}

export function isValidBranchNameByCode({
  bankCode,
  branchCode,
  branchName,
}: {
  bankCode: string;
  branchCode: string;
  branchName: string;
}) {
  const branch = zenginCode[bankCode]?.branches[branchCode];

  return branch?.name === branchName;
}
