export type AppLoginForm = {
  email: string;
  password: string;
};

export type CognitoAuthTokens = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
};
