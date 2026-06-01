import { redirect } from "next/navigation";
import { GOOGLE_AUTH_CONFIG } from "@/constants/auth";

export default function HomePage() {
  redirect(GOOGLE_AUTH_CONFIG.successPath);
}
