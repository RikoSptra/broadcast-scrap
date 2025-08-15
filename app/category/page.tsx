"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, X, Pencil, Trash2 } from "lucide-react";
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
import { useLoadingSpinner } from "@/components/LoadingSpinner";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
} from "@/app/actions/category";

interface Category {
  _id: string;
  name: string;
}

function CategoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const { showLoading, hideLoading } = useLoadingSpinner();
  const [isLoading, setIsLoading] = useState(false);

  // Dummy data untuk contoh
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, []);

  const loadData = async () => {
    try {
      showLoading();
      const response = await getAllCategory();
      console.log(response);
      setCategories(response);
      setNewCategoryName("");
    } catch (error) {
      // toast.error("Gagal memuat data broadcast");
    } finally {
      hideLoading();
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        _id: (categories.length + 1).toString(),
        name: newCategoryName.trim(),
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsDialogOpen(false);
    }
  };

  const submitEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedCategory) return;
      setIsLoading(true);
      await updateCategory(selectedCategory._id, { name: newCategoryName });
      await loadData();
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      if (!selectedCategory) return;
      setIsLoading(true);
      await deleteCategory(selectedCategory._id);
      setSelectedCategory(null);
      await loadData();
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const test = await createCategory({ name: newCategoryName });
      await loadData();
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
                <h1 className="text-2xl font-bold">Kategori</h1>
                <p className="text-green-100">
                  Kelola kategori untuk pengelompokan kontak
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-green-600 hover:bg-gray-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kategori
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedCategory
                        ? "Edit Kategori"
                        : "Tambah Kategori Baru"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedCategory
                        ? "Edit nama kategori yang sudah ada"
                        : "Tambahkan kategori baru untuk mengelompokkan kontak"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Nama Kategori"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setNewCategoryName("");
                          setSelectedCategory(null);
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={
                          selectedCategory ? submitEditCategory : submitCategory //handleAddCategory
                        }
                        disabled={!newCategoryName.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {selectedCategory
                          ? "Simpan Perubahan"
                          : "Simpan Kategori"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kategori ({filteredCategories.length})</CardTitle>
            <CardDescription>
              Kelola kategori untuk pengelompokan kontak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category);
                              setNewCategoryName(category.name);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori "
              {selectedCategory?.name}"? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCategory(null);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus Kategori
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(CategoryPage);
