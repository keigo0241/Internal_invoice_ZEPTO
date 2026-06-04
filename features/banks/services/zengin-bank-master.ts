import zenginCode from "zengin-code";
import {
  type BankBranchOption,
  type BankOption,
} from "@/features/banks/types/bank";

const BANK_SEARCH_LIMIT = 20;
const BRANCH_SEARCH_LIMIT = 50;

function normalizeKeyword(keyword: string | null) {
  return keyword?.trim().toLowerCase() ?? "";
}

function includesKeyword(value: string, keyword: string) {
  return value.toLowerCase().includes(keyword);
}

function matchesBankKeyword(bank: BankOption, keyword: string) {
  if (!keyword) {
    return true;
  }

  return (
    includesKeyword(bank.code, keyword) ||
    includesKeyword(bank.name, keyword) ||
    includesKeyword(bank.kana, keyword)
  );
}

function matchesBranchKeyword(branch: BankBranchOption, keyword: string) {
  if (!keyword) {
    return true;
  }

  return (
    includesKeyword(branch.code, keyword) ||
    includesKeyword(branch.name, keyword) ||
    includesKeyword(branch.kana, keyword)
  );
}

export function searchBanks(keyword: string | null): BankOption[] {
  const normalizedKeyword = normalizeKeyword(keyword);

  return Object.values(zenginCode)
    .map((bank) => ({
      code: bank.code,
      name: bank.name,
      kana: bank.kana,
    }))
    .filter((bank) => matchesBankKeyword(bank, normalizedKeyword))
    .slice(0, BANK_SEARCH_LIMIT);
}

export function searchBankBranches(
  bankCode: string,
  keyword: string | null,
): BankBranchOption[] {
  const bank = zenginCode[bankCode];

  if (!bank) {
    return [];
  }

  const normalizedKeyword = normalizeKeyword(keyword);

  return Object.values(bank.branches)
    .map((branch) => ({
      code: branch.code,
      name: branch.name,
      kana: branch.kana,
    }))
    .filter((branch) => matchesBranchKeyword(branch, normalizedKeyword))
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
