"use client"

import { useState } from "react"
import { ArrowLeft, Plus, QrCode, Smartphone, Wifi, CheckCircle, Settings, Trash2 } from 'lucide-react'
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

const whatsappAccounts = [
  {
    id: 1,
    name: "WA Bisnis Utama",
    phone: "+62812-3456-7890",
    status: "connected",
    device: "iPhone 12 Pro",
    lastConnected: "2 menit yang lalu",
    messagesCount: 1250,
    isDefault: true
  },
  {
    id: 2,
    name: "WA Marketing",
    phone: "+62813-9876-5432",
    status: "disconnected",
    device: "Samsung Galaxy S21",
    lastConnected: "2 jam yang lalu",
    messagesCount: 890,
    isDefault: false
  },
  {
    id: 3,
    name: "WA Customer Service",
    phone: "+62814-1111-2222",
    status: "connected",
    device: "iPhone 13",
    lastConnected: "Aktif sekarang",
    messagesCount: 2100,
    isDefault: false
  }
]

export default function WhatsAppManagement() {
  const [accounts, setAccounts] = useState(whatsappAccounts)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [scanningProgress, setScanningProgress] = useState(0)
  const [isScanning, setIsScanning] = useState(false)

  const handleStartScan = () => {
    setIsScanning(true)
    setScanningProgress(0)
    
    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          setIsAddingNew(false)
          // Add new account
          const newAccount = {
            id: Date.now(),
            name: newAccountName || "WhatsApp Baru",
            phone: "+62815-0000-0000",
            status: "connected" as const,
            device: "Unknown Device",
            lastConnected: "Baru saja",
            messagesCount: 0,
            isDefault: false
          }
          setAccounts([...accounts, newAccount])
          setNewAccountName("")
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleSetDefault = (id: number) => {
    setAccounts(accounts.map(account => ({
      ...account,
      isDefault: account.id === id
    })))
  }

  const handleDisconnect = (id: number) => {
    setAccounts(accounts.map(account => 
      account.id === id ? { ...account, status: "disconnected" as const } : account
    ))
  }

  const connectedCount = accounts.filter(acc => acc.status === "connected").length
  const totalMessages = accounts.reduce((sum, acc) => sum + acc.messagesCount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4 text-white hover:bg-green-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">WhatsApp Management</h1>
                <p className="text-green-100">Kelola semua akun WhatsApp Anda</p>
              </div>
            </div>
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
              <DialogTrigger asChild>
                <Button className="bg-white text-green-600 hover:bg-gray-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah WhatsApp
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah WhatsApp Baru</DialogTitle>
                  <DialogDescription>
                    Scan QR Code untuk menghubungkan akun WhatsApp baru
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Nama Akun</Label>
                    <Input
                      id="account-name"
                      placeholder="Contoh: WA Marketing"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />
                  </div>
                  
                  {!isScanning ? (
                    <div className="text-center space-y-4">
                      <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">QR Code akan muncul di sini</p>
                        </div>
                      </div>
                      <Button onClick={handleStartScan} className="w-full bg-green-500 hover:bg-green-600">
                        <QrCode className="h-4 w-4 mr-2" />
                        Mulai Scan QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-48 h-48 mx-auto bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-pulse">
                            <QrCode className="h-12 w-12 mx-auto text-green-600 mb-2" />
                          </div>
                          <p className="text-green-700 font-medium">Menunggu scan...</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">Menghubungkan ke WhatsApp Web...</p>
                        <Progress value={scanningProgress} className="w-full" />
                        <p className="text-sm text-gray-600">{scanningProgress}% selesai</p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total WhatsApp</CardTitle>
              <Smartphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{accounts.length}</div>
              <p className="text-xs text-muted-foreground">Akun terdaftar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terhubung</CardTitle>
              <Wifi className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
              <p className="text-xs text-muted-foreground">Akun aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Pesan terkirim</p>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Akun WhatsApp</CardTitle>
            <CardDescription>
              Kelola semua akun WhatsApp yang terhubung dengan aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead>Nomor Telepon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Last Connected</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            account.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <Badge 
                            variant={account.status === 'connected' ? 'default' : 'secondary'}
                            className={account.status === 'connected' ? 'bg-green-500' : ''}
                          >
                            {account.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{account.device}</TableCell>
                      <TableCell className="text-sm text-gray-600">{account.lastConnected}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.messagesCount.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>
                        {account.isDefault ? (
                          <Badge className="bg-green-500">Default</Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetDefault(account.id)}
                          >
                            Set Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          {account.status === 'connected' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDisconnect(account.id)}
                            >
                              Disconnect
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600">
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
    </div>
  )
}
