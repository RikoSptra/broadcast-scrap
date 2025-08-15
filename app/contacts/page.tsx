"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Users,
  Circle,
  Plus,
  X,
  Album,
} from "lucide-react";
import Link from "next/link";
import { withAuth } from "@/middleware/withAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  googleMapsScrapper,
  getAllGoogleScrapData,
} from "@/app/actions/scrapper";
import { useLoadingSpinner } from "@/components/LoadingSpinner";

interface Contact {
  name: string;
  phone: string;
  rating: number;
  reviews: number;
  price: string;
  website: string;
  address: string;
  coordinate: string;
  status?: string;
  source?: string;
  broadcastSource?: string;
}

function AllContacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { showLoading, hideLoading } = useLoadingSpinner();

  // Tambahkan state untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, [currentPage, searchTerm]);

  // Hapus filteredContacts karena filter akan dilakukan di server
  // const filteredContacts = contacts.filter((contact) => {
  //   const matchesSearch =
  //     contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     contact.phone.includes(searchTerm);
  //   return matchesSearch;
  // });

  const onlineCount = 0;
  const offlineCount = 0;

  const loadData = async () => {
    try {
      showLoading();
      const response = await getAllGoogleScrapData({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      // Transform data to match Contact interface
      const transformedData = response.data.map((item: any) => ({
        name: item.title,
        phone: item.phone.replace(/[\s+-]/g, ""),
        rating: item.rating,
        reviews: item.reviews,
        price: item.price,
        website: item.website,
        address: item.address,
        coordinate: `${item.latitude},${item.longitude}`,
      }));

      setContacts(transformedData);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setItemsPerPage(response.pagination.itemsPerPage);
    } catch (error) {
      // toast.error("Gagal memuat data broadcast");
    } finally {
      hideLoading();
    }
  };

  // Tambahkan fungsi untuk menangani perubahan pencarian
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset halaman ke 1 ketika melakukan pencarian baru
  };

  // Tambahkan fungsi untuk menangani perubahan halaman
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddQuery = () => {
    const lengthQueries = [...searchQueries, ""];
    if (lengthQueries.length <= 5) {
      setSearchQueries([...searchQueries, ""]);
    }
  };

  const handleQueryChange = (index: number, value: string) => {
    const newQueries = [...searchQueries];
    newQueries[index] = value;
    setSearchQueries(newQueries);
  };

  const handleRemoveQuery = (index: number) => {
    const newQueries = searchQueries.filter((_, i) => i !== index);
    setSearchQueries(newQueries);
  };

  const handleSubmitQueries = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const queriesText = searchQueries.join(",");
      const response = await googleMapsScrapper({ searchQuery: queriesText });

      loadData();
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

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
              <Link href="/category">
                <Button className="bg-white text-green-600 hover:bg-gray-50">
                  <Album className="h-4 w-4 mr-2" />
                  Kategori
                </Button>
              </Link>

              <Dialog
                open={isDialogOpen}
                onOpenChange={() => {
                  setIsDialogOpen(true);
                  setSearchQueries([]);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-white text-green-600 hover:bg-gray-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Tambah Contact Baru</DialogTitle>
                    <DialogDescription>
                      Tambahkan kata kunci pencarian untuk mencari contact baru
                      dari Google Maps
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        Kata Kunci Pencarian
                      </h3>
                      <Button onClick={handleAddQuery} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Query
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {searchQueries.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Belum ada query pencarian. Klik "Tambah Query" untuk
                          menambahkan.
                        </p>
                      ) : (
                        searchQueries.map((query, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="flex-1">
                              <Input
                                placeholder="Kata kunci pencarian ex: Cafe di Surabaya"
                                value={query}
                                onChange={(e) =>
                                  handleQueryChange(index, e.target.value)
                                }
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveQuery(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSearchQueries([]);
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleSubmitQueries}
                        disabled={
                          searchQueries.filter((q) => q.trim() !== "")
                            .length === 0
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mulai Pencarian
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                {totalItems}
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
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              </Select> */}
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Contact ({totalItems})</CardTitle>
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
                    <TableHead>Alamat</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Google Maps Loc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {contact.name}
                      </TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.address}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {contact.rating}
                      </TableCell>
                      <TableCell>{contact.reviews}</TableCell>
                      <TableCell>{contact.price}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {contact.website}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://www.google.com/maps?q=${contact.name}+${contact.coordinate}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Lihat di Maps
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Tambahkan Pagination UI */}
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-gray-700">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} dari{" "}
                  {totalItems} data
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default withAuth(AllContacts);
