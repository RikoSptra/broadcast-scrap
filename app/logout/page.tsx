"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900 dark:to-green-950 flex items-center justify-center">
      <Card className="w-[90%] max-w-md border-green-100 dark:border-green-800">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-100 mb-2">
            Logout Berhasil
          </h1>
          <p className="text-green-600 dark:text-green-300">
            Anda akan dialihkan ke halaman login dalam beberapa detik...
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 