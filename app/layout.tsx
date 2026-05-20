import "./globals.css"
import { AppSidebar } from "@/components/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="flex">
          <AppSidebar />

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}