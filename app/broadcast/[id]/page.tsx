"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { withAuth } from "@/middleware/withAuth";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBroadcastById, scrapGoogleMaps, runBroadcast } from "@/app/actions/broadcast";

interface BroadcastMessage {
  type: 'text' | 'image' | 'document';
  content: string;
  file?: string;
}

interface Broadcast {
  id: string;
  name: string;
  description: string;
  messages: BroadcastMessage[];
  createdAt: Date;
  updatedAt: Date;
  totalContacts?: number;
  scrapedContacts?: string[];
}

function BroadcastDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBroadcast();
  }, []);

  const loadBroadcast = async () => {
    try {
      const data = await getBroadcastById(params.id as string);
      setBroadcast(data);
    } catch (error) {
      toast.error("Gagal memuat data broadcast");
      router.push("/broadcast");
    }
  };

  const handleScrapGoogleMaps = async () => {
    if (!searchQuery.trim()) {
      toast.error("Masukkan kata kunci pencarian");
      return;
    }

    setIsScraping(true);
    try {
      const result = await scrapGoogleMaps(params.id as string, searchQuery);
      setBroadcast(prev => ({
        ...prev!,
        totalContacts: result.totalContacts,
        scrapedContacts: result.contacts
      }));
      toast.success(`Berhasil mengambil ${result.totalContacts} kontak`);
    } catch (error) {
      toast.error("Gagal melakukan scraping");
    } finally {
      setIsScraping(false);
    }
  };

  const handleRunBroadcast = async () => {
    if (!broadcast?.totalContacts) {
      toast.error("Belum ada kontak yang di-scraping");
      return;
    }

    setIsRunning(true);
    try {
      await runBroadcast(params.id as string);
      toast.success("Broadcast berhasil dijalankan");
    } catch (error) {
      toast.error("Gagal menjalankan broadcast");
    } finally {
      setIsRunning(false);
    }
  };

  if (!broadcast) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/broadcast">
                <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-green-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{broadcast.name}</h1>
                <p className="text-green-100">{broadcast.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Pesan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {broadcast.messages.map((message, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="font-semibold mb-2">Tipe: {message.type}</p>
                    {message.type === 'text' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <>
                        {message.file && (
                          <div className="mb-2">
                            {message.type === 'image' ? (
                              <img src={message.file} alt="Preview" className="max-w-xs rounded" />
                            ) : (
                              <p className="text-sm text-gray-500">File dokumen terlampir</p>
                            )}
                          </div>
                        )}
                        {message.content && (
                          <p className="text-gray-600">Caption: {message.content}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scraping Google Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Masukkan kata kunci pencarian (contoh: Restoran di Jakarta)"
                      disabled={isScraping}
                    />
                  </div>
                  <Button 
                    onClick={handleScrapGoogleMaps}
                    disabled={isScraping}
                  >
                    {isScraping ? "Sedang Scraping..." : "Mulai Scraping"}
                  </Button>
                </div>

                {broadcast.totalContacts !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold">Total Kontak: {broadcast.totalContacts}</p>
                    {broadcast.scrapedContacts && broadcast.scrapedContacts.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium mb-2">Daftar Kontak:</p>
                        <div className="max-h-40 overflow-y-auto">
                          {broadcast.scrapedContacts.map((contact, index) => (
                            <p key={index} className="text-sm text-gray-600">{contact}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleRunBroadcast}
              disabled={!broadcast.totalContacts || isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isRunning ? "Menjalankan Broadcast..." : "Jalankan Broadcast"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(BroadcastDetailPage); 