import { withApi } from "@/lib/api/with-api";
import { handleGet } from "@/app/api/v1/auth/google/callback/get";

export const GET = withApi(handleGet, []);
