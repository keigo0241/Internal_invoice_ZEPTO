import { jp } from "@/assets/translations/jp";
import { type LoginErrorCode } from "@/constants/auth";
import { LoginContent } from "./content";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getLoginErrorMessage(error: string | string[] | undefined) {
  const errorCode = Array.isArray(error) ? error[0] : error;

  if (!isLoginErrorCode(errorCode)) {
    return null;
  }

  return jp.login.errors[errorCode];
}

function isLoginErrorCode(
  errorCode: string | undefined,
): errorCode is LoginErrorCode {
  return Boolean(errorCode && errorCode in jp.login.errors);
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = getLoginErrorMessage(error);

  return <LoginContent errorMessage={errorMessage} />;
}
