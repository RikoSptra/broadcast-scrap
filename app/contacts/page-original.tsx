"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Users,
  Circle,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const contacts = [
  {
    id: 1,
    name: "Ahmad Rizki",
    phone: "+62812-3456-7890",
    status: "online",
    lastSeen: "2 menit yang lalu",
    source: "Google Maps - Toko Elektronik Jakarta",
    broadcastSource: "Promo Ramadan 2024",
    broadcastCount: 5,
    lastBroadcast: "2 jam yang lalu",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    phone: "+62813-9876-5432",
    status: "offline",
    lastSeen: "1 jam yang lalu",
    source: "Manual Input",
    broadcastSource: "Info Produk Baru",
    broadcastCount: 3,
    lastBroadcast: "1 hari yang lalu",
  },
  {
    id: 3,
    name: "Budi Santoso",
    phone: "+62814-1111-2222",
    status: "online",
    lastSeen: "Aktif sekarang",
    source: "Google Maps - Restoran Padang",
    broadcastSource: "Follow Up Customer",
    broadcastCount: 8,
    lastBroadcast: "30 menit yang lalu",
  },
  {
    id: 4,
    name: "Maya Sari",
    phone: "+62815-3333-4444",
    status: "offline",
    lastSeen: "3 hari yang lalu",
    source: "Scan QR Code",
    broadcastSource: "Promo Ramadan 2024",
    broadcastCount: 2,
    lastBroadcast: "3 hari yang lalu",
  },
  {
    id: 5,
    name: "Dedi Kurniawan",
    phone: "+62816-5555-6666",
    status: "online",
    lastSeen: "15 menit yang lalu",
    source: "Google Maps - Bengkel Motor",
    broadcastSource: "Info Produk Baru",
    broadcastCount: 6,
    lastBroadcast: "1 jam yang lalu",
  },
];

export default function AllContacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [broadcastFilter, setBroadcastFilter] = useState("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" ||
      contact.source.toLowerCase().includes(sourceFilter.toLowerCase());
    const matchesBroadcast =
      broadcastFilter === "all" ||
      contact.broadcastSource
        .toLowerCase()
        .includes(broadcastFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSource && matchesBroadcast;
  });

  const onlineCount = contacts.filter((c) => c.status === "online").length;
  const offlineCount = contacts.filter((c) => c.status === "offline").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-4 text-white hover:bg-green-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">All Contacts</h1>
                <p className="text-green-100">
                  Semua contact terpusat dari berbagai broadcast
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-white text-green-600 hover:bg-gray-50">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Contact
              </Button>
              <Button className="bg-white text-green-600 hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contacts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Semua contact terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <Circle className="h-4 w-4 text-green-500 fill-current" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {onlineCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Contact yang sedang online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offline</CardTitle>
              <Circle className="h-4 w-4 text-gray-400 fill-current" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {offlineCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Contact yang sedang offline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama atau nomor telepon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={broadcastFilter}
                onValueChange={setBroadcastFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Broadcast" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Broadcast</SelectItem>
                  <SelectItem value="promo">Promo Ramadan</SelectItem>
                  <SelectItem value="info">Info Produk</SelectItem>
                  <SelectItem value="follow">Follow Up</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sumber</SelectItem>
                  <SelectItem value="google">Google Maps</SelectItem>
                  <SelectItem value="manual">Manual Input</SelectItem>
                  <SelectItem value="scan">Scan QR Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Contact ({filteredContacts.length})</CardTitle>
            <CardDescription>
              Semua contact terpusat dari berbagai broadcast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Nomor Telepon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Dari Broadcast</TableHead>
                    <TableHead>Total Broadcast</TableHead>
                    <TableHead>Last Broadcast</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {contact.name}
                      </TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Circle
                            className={`h-2 w-2 mr-2 fill-current ${
                              contact.status === "online"
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                          <Badge
                            variant={
                              contact.status === "online"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              contact.status === "online" ? "bg-green-500" : ""
                            }
                          >
                            {contact.status === "online" ? "Online" : "Offline"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {contact.lastSeen}
                      </TableCell>
                      <TableCell className="text-sm">
                        {contact.source}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          {contact.broadcastSource}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contact.broadcastCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {contact.lastBroadcast}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
