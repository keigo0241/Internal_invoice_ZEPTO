import { withApi } from "@/lib/api/with-api";
import { handlePost } from "./post";

export const POST = withApi(handlePost, []);
