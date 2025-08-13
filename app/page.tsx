"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Globe, LogOut } from "lucide-react";
import { withAuth } from "@/middleware/withAuth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { useLoadingSpinner } from "@/components/LoadingSpinner";

function Dashboard() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoadingSpinner();

  const handleLogout = async () => {
    showLoading();
    try {
      await auth.logout();
      router.push("/logout");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900 dark:to-green-950">
      <div className="container mx-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-100">
              Dashboard
            </h1>
            <p className="text-green-600 dark:text-green-300">
              Selamat datang di sistem broadcast
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-green-100 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span>Broadcast by Scraping</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Kelola dan atur broadcast menggunakan data scraping
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push("/broadcast")}
              >
                Akses Menu
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-green-100 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Kelola pesan dan koneksi WhatsApp
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push("/whatsapp")}
              >
                Akses Menu
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-green-100 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <span>Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Kelola daftar kontak dan grup
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push("/contacts")}
              >
                Akses Menu
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-green-50 dark:bg-green-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
                Total Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                0
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
                Kontak Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                0
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
                Pesan Terkirim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                0
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
                Status WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <p className="text-green-900 dark:text-green-50">Menunggu</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
