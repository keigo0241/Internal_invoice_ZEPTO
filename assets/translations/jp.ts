import { LOGIN_ERROR_CODE, type LoginErrorCode } from "@/constants/auth";

export const jp = {
  login: {
    title: "ログイン",
    descriptionLine1: "〇〇〇@zpt-ai.comのGoogleアカウントで",
    descriptionLine2: "認証してください。",
    googleAuthButton: "Google認証はこちら",
    note: "Google認証後にアプリ内ログインを行います",
    errors: {
      [LOGIN_ERROR_CODE.invalidGoogleDomain]:
        "社内アカウント（@zpt-ai.com）でログインしてください。",
      [LOGIN_ERROR_CODE.googleAuthFailed]:
        "Google認証に失敗しました。もう一度お試しください。",
      [LOGIN_ERROR_CODE.invalidGoogleState]:
        "認証情報を確認できませんでした。もう一度ログインしてください。",
    } satisfies Record<LoginErrorCode, string>,
  },
  appLogin: {
    title: "アプリ内ログイン",
    googleVerifiedEmailLabel: "Google認証済みメールアドレス",
    nextImplementationNote:
      "次の実装で、初回利用判定とアプリ内ログインを接続します。",
  },
  invoices: {
    title: "請求書一覧",
    allFilterMessage: "すべての請求書を表示しています。",
    filteredMessageSuffix: "の請求書を表示しています。",
    filters: {
      all: "すべて",
      draft: "下書き",
      returned: "差戻",
    },
    placeholder: "請求書データ取得処理は今後ここに接続します。",
  },
} as const;
