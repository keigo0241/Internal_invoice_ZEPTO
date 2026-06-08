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
      [LOGIN_ERROR_CODE.dbConnectionFailed]:
        "ユーザー情報を確認できませんでした。時間をおいてもう一度お試しください。",
    } satisfies Record<LoginErrorCode, string>,
  },
  appLogin: {
    title: "アプリ内ログイン",
    description: "登録済みのメールアドレスとパスワードを入力してください。",
    labels: {
      email: "メールアドレス",
      password: "パスワード",
    },
    placeholders: {
      email: "example@zpt-ai.com",
      password: "半角英数字で入力",
    },
    loginButton: "ログイン",
    passwordResetLink: "パスワードをお忘れの場合",
  },
  initialRegistration: {
    title: "初回登録",
    userSectionTitle: "ユーザー情報",
    bankSectionTitle: "口座情報",
    labels: {
      name: "氏名",
      email: "メールアドレス",
      password: "パスワード",
      passwordConfirmation: "パスワード確認用",
      address: "住所",
      phoneNumber: "電話番号",
      bankName: "銀行名",
      accountType: "預金種目",
      branchName: "店名",
      accountNumber: "口座番号",
      accountHolder: "口座名義",
    },
    placeholders: {
      name: "辻井 啓悟",
      password: "8文字以上で入力",
      passwordConfirmation: "もう一度入力",
      address: "東京都〇〇区〇〇",
      phoneNumber: "09012345678",
      bankName: "〇〇銀行",
      branchName: "〇〇支店",
      accountNumber: "1234567",
      accountHolder: "ツジイ ケイゴ",
    },
    requiredBadge: "必須",
    optionalBadge: "任意",
    accountTypeOptions: {
      ordinary: "普通預金",
      checking: "当座預金",
      savings: "貯蓄預金",
    },
    submitButton: "ユーザー情報登録",
    submittingButton: "登録中",
    registrationError:
      "ユーザー情報を登録できませんでした。入力内容を確認してください。",
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
