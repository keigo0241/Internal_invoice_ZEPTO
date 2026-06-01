import { withApi } from "@/lib/api/with-api";
import { handleGet } from "./get";

export const GET = withApi(handleGet, []);
