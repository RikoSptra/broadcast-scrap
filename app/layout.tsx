import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LoadingSpinnerProvider } from "@/components/LoadingSpinner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WA Broadcast",
  description: "WA Broadcast Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoadingSpinnerProvider>
          {children}
        </LoadingSpinnerProvider>
      </body>
    </html>
  );
}
