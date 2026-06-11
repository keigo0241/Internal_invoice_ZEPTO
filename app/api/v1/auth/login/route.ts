import { requireJsonRequestGuard } from "@/lib/api/guards/require-json-request-guard";
import { withAuth } from "@/lib/api/with-auth";
import { handlePost } from "./post";

export const POST = withAuth(handlePost, [requireJsonRequestGuard]);
