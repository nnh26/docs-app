import type { Metadata } from "next";
import "./globals.css";
import UserSwitcher from "./components/UserSwitcher";

export const metadata: Metadata = {
  title: "Docs",
  description: "A lightweight collaborative document editor",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="flex items-center justify-between border-b border-gray-300 px-6 py-3">
          <a href="/" className="text-lg font-semibold">
            Docs
          </a>
          <UserSwitcher />
        </header>
        <main className="mx-auto max-w-4xl p-6">{children}</main>
      </body>
    </html>
  );
}