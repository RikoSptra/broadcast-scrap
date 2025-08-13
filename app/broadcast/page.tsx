"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  PlusCircle,
  FileText,
  Image as ImageIcon,
  Plus,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { withAuth } from "@/middleware/withAuth";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBroadcast,
  getBroadcasts,
  deleteBroadcast,
  updateBroadcast,
  getBroadcast,
} from "@/app/actions/broadcast";
import { useLoadingSpinner } from "@/components/LoadingSpinner";

interface BroadcastMessage {
  type: "text" | "image" | "document";
  content: string;
  file?: File;
  existingFile?: string; // untuk menyimpan file yang sudah ada dalam format base64
}

function BroadcastPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    messages: [] as BroadcastMessage[],
  });
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const { showLoading, hideLoading } = useLoadingSpinner();
  useEffect(() => {
    loadBroadcasts();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      messages: [],
    });
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = async (id: string) => {
    try {
      const broadcast = await getBroadcast(id);
      if (broadcast) {
        setFormData({
          name: broadcast.name,
          description: broadcast.description,
          messages: broadcast.messages.map((msg) => ({
            type: msg.type,
            content: msg.content,
            file: undefined,
            existingFile: msg.file,
          })),
        });
        setEditingId(id);
        setIsDialogOpen(true);
      }
    } catch (error) {
      toast.error("Gagal memuat data broadcast");
    }
  };

  const loadBroadcasts = async () => {
    try {
      const data = await getBroadcasts();
      setBroadcasts(data);
    } catch (error) {
      toast.error("Gagal memuat data broadcast");
    }
  };

  const handleAddMessage = () => {
    setFormData({
      ...formData,
      messages: [...formData.messages, { type: "text", content: "" }],
    });
  };

  const handleRemoveMessage = (index: number) => {
    const newMessages = [...formData.messages];
    newMessages.splice(index, 1);
    setFormData({
      ...formData,
      messages: newMessages,
    });

    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleMessageChange = (index: number, value: string) => {
    const newMessages = [...formData.messages];
    newMessages[index].content = value;
    setFormData({
      ...formData,
      messages: newMessages,
    });
  };

  const handleFileChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newMessages = [...formData.messages];
    newMessages[index].file = file;
    setFormData({
      ...formData,
      messages: newMessages,
    });
  };

  const handleTypeChange = (index: number, type: BroadcastMessage["type"]) => {
    const newMessages = [...formData.messages];
    newMessages[index] = { type, content: "", file: undefined };
    setFormData({
      ...formData,
      messages: newMessages,
    });

    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: number]: string } = {};
    let isValid = true;

    formData.messages.forEach((message, index) => {
      if (message.type === "text" && !message.content.trim()) {
        newErrors[index] = "Pesan text tidak boleh kosong";
        isValid = false;
      } else if (
        (message.type === "image" || message.type === "document") &&
        !message.file &&
        !message.existingFile
      ) {
        newErrors[index] = `${
          message.type === "image" ? "Gambar" : "Dokumen"
        } harus diupload`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.messages.length) {
      toast.error("Tambahkan minimal satu pesan");
      return;
    }

    if (!validateForm()) {
      toast.error("Mohon periksa kembali form anda");
      return;
    }

    setIsLoading(true);
    try {
      showLoading();
      const submissionData = {
        name: formData.name,
        description: formData.description,
        messages: formData.messages.map((msg) => ({
          type: msg.type,
          content: msg.content,
          file: msg.file,
          existingFile: msg.existingFile,
        })),
      };

      if (editingId) {
        await updateBroadcast(editingId, submissionData);
        toast.success("Broadcast berhasil diperbarui");
      } else {
        await createBroadcast(submissionData);
        toast.success("Broadcast berhasil dibuat");
      }
      resetForm();
      loadBroadcasts();
    } catch (error) {
      toast.error(
        editingId ? "Gagal memperbarui broadcast" : "Gagal membuat broadcast"
      );
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      hideLoading();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus broadcast ini?")) return;

    try {
      await deleteBroadcast(id);
      toast.success("Broadcast berhasil dihapus");
      loadBroadcasts();
    } catch (error) {
      toast.error("Gagal menghapus broadcast");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-2xl font-bold">Broadcast Management</h1>
                <p className="text-green-100">
                  Kelola broadcast menggunakan data scraping
                </p>
              </div>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (!open) resetForm();
                setIsDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-white text-green-600 hover:bg-gray-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Broadcast
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Broadcast" : "Buat Broadcast Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Edit broadcast yang sudah ada."
                      : "Buat broadcast baru untuk mengirim pesan ke banyak kontak sekaligus."}
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 flex-1 overflow-hidden flex flex-col"
                >
                  <div className="space-y-4 flex-1 overflow-y-auto pr-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Broadcast</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Masukkan nama broadcast"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Masukkan deskripsi broadcast"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Pesan Broadcast</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddMessage}
                          className="flex items-center"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Tambah Pesan
                        </Button>
                      </div>
                      {formData.messages.map((message, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-4 border rounded-lg relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveMessage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex gap-2 mb-2">
                            <Button
                              type="button"
                              variant={
                                message.type === "text" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handleTypeChange(index, "text")}
                            >
                              Text
                            </Button>
                            <Button
                              type="button"
                              variant={
                                message.type === "image" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handleTypeChange(index, "image")}
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Gambar
                            </Button>
                            <Button
                              type="button"
                              variant={
                                message.type === "document"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleTypeChange(index, "document")
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Dokumen
                            </Button>
                          </div>
                          {message.type === "text" ? (
                            <>
                              <Textarea
                                value={message.content}
                                onChange={(e) =>
                                  handleMessageChange(index, e.target.value)
                                }
                                placeholder="Masukkan pesan yang akan dikirim"
                                className={`min-h-[100px] ${
                                  errors[index] ? "border-red-500" : ""
                                }`}
                              />
                              {errors[index] && (
                                <p className="text-sm text-red-500">
                                  {errors[index]}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="space-y-2">
                              {message.existingFile && (
                                <div className="mb-2">
                                  {message.type === "image" ? (
                                    <img
                                      src={message.existingFile}
                                      alt="Preview"
                                      className="max-w-[200px] max-h-[200px] object-contain rounded-lg"
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <FileText className="h-4 w-4" />
                                      <span>File sudah ada</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <Input
                                type="file"
                                accept={
                                  message.type === "image"
                                    ? "image/*"
                                    : ".pdf,.doc,.docx"
                                }
                                onChange={(e) => handleFileChange(index, e)}
                                className={
                                  errors[index] ? "border-red-500" : ""
                                }
                              />
                              {errors[index] && (
                                <p className="text-sm text-red-500">
                                  {errors[index]}
                                </p>
                              )}
                              {message.file && (
                                <p className="text-sm text-gray-500">
                                  File baru terpilih: {message.file.name}
                                </p>
                              )}
                              <Textarea
                                value={message.content}
                                onChange={(e) =>
                                  handleMessageChange(index, e.target.value)
                                }
                                placeholder="Tambahkan caption untuk media ini (opsional)"
                                className="min-h-[60px]"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {formData.messages.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          Belum ada pesan. Klik "Tambah Pesan" untuk membuat
                          pesan baru.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={formData.messages.length === 0 || isLoading}
                    >
                      {isLoading
                        ? "Memproses..."
                        : editingId
                        ? "Simpan Perubahan"
                        : "Buat Broadcast"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Daftar Broadcast</CardTitle>
          </CardHeader>
          <CardContent>
            {broadcasts.length > 0 ? (
              <div className="space-y-4">
                {broadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {broadcast.name}
                        </h3>
                        <p className="text-gray-600">{broadcast.description}</p>
                        <p className="text-sm text-gray-500">
                          Dibuat:{" "}
                          {new Date(broadcast.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/broadcast/${broadcast.id}`}>
                          <Button variant="outline" size="sm">
                            Masuk
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(broadcast.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(broadcast.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                Belum ada data broadcast. Silakan buat broadcast baru dengan
                mengklik tombol "Buat Broadcast".
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(BroadcastPage);
