import { withAuth } from "@/lib/api/with-auth";
import { handleGet } from "./get";

export const GET = withAuth(handleGet);
