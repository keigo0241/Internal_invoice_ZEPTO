import { withAuth } from "@/features/auth/guards/with-auth";
import { handleGet } from "./get";

export const GET = withAuth(handleGet);
