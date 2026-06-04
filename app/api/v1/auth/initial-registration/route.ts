import { withAuth } from "@/features/auth/guards/with-auth";
import { requireJsonRequestGuard } from "@/lib/api/guards/require-json-request-guard";
import { handlePost } from "./post";

export const POST = withAuth(handlePost, [requireJsonRequestGuard]);
