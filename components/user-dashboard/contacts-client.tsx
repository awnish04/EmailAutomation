"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Search,
  Plus,
  Upload,
  Filter,
  MoreHorizontal,
  Trash2,
  Mail,
  Tag,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  TrendingUp,
  AlertTriangle,
  Send,
  UserCheck,
  UserMinus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface Contact {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  status: string
  tags: string[]
  source: string | null
  createdAt: string
}

interface List {
  id: string
  name: string
}

interface ContactStats {
  active: number
  unsubscribed: number
  bounced: number
  complained: number
}

interface ContactsClientProps {
  initialContacts: Contact[]
  initialTotal: number
  lists: List[]
  allTags: string[]
  contactStats?: ContactStats
}

// ── Engagement tier helper ───────────────────────────────────────────────────
function getEngagementTier(contact: Contact): { label: string; icon: React.ElementType; cls: string } {
  // Heuristic: recently created = warm, has tags = more engaged
  const daysSinceCreated = Math.floor((Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const tagCount = contact.tags.length
  if (contact.status !== "ACTIVE") {
    return { label: "Inactive", icon: AlertTriangle, cls: "text-red-400" }
  }
  if (daysSinceCreated <= 7 && tagCount >= 1) {
    return { label: "Hot", icon: Flame, cls: "text-orange-400" }
  }
  if (daysSinceCreated <= 30) {
    return { label: "Warm", icon: TrendingUp, cls: "text-amber-400" }
  }
  return { label: "Cold", icon: Mail, cls: "text-sky-400" }
}

export function ContactsClient({
  initialContacts,
  initialTotal,
  lists,
  allTags,
  contactStats,
}: ContactsClientProps) {
  // React import needed for React.ElementType in getEngagementTier
  // (already available via JSX transform)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [listId, setListId] = useState(searchParams.get("listId") || "all")
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const limit = 50

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Fetch data
  const fetchData = useCallback(
    async (
      pSearch: string,
      pStatus: string,
      pListId: string,
      pPage: number
    ) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", pPage.toString())
        params.set("limit", limit.toString())
        if (pSearch) params.set("search", pSearch)
        if (pStatus && pStatus !== "all") params.set("status", pStatus)
        if (pListId && pListId !== "all") params.set("listId", pListId)

        // Update URL for shareability
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })

        const res = await fetch(`/api/contacts?${params.toString()}`)
        const data = await res.json()

        if (res.ok) {
          setContacts(data.contacts)
          setTotal(data.total)
        } else {
          toast.error(data.error || "Failed to fetch contacts")
        }
      } catch (err) {
        toast.error("An error occurred while fetching data")
      } finally {
        setLoading(false)
      }
    },
    [pathname, router]
  )

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to page 1 on new search/filter
      setPage(1)
      fetchData(search, status, listId, 1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, status, listId, fetchData])

  // Change page
  useEffect(() => {
    if (page > 1 || searchParams.has("page")) {
      fetchData(search, status, listId, page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]) // Only run when page changes independently of filters

  const totalPages = Math.ceil(total / limit)

  // Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length && contacts.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Contact deleted")
        fetchData(search, status, listId, page)

        if (selectedIds.has(id)) {
          const newSet = new Set(selectedIds)
          newSet.delete(id)
          setSelectedIds(newSet)
        }
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete contact")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  // --- Add Contact Modal State ---
  const [addForm, setAddForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    tags: [] as string[],
    listId: "none",
    tagInput: "",
  })

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Add pending tag if exists
    let finalTags = [...addForm.tags]
    if (addForm.tagInput.trim()) {
      if (!finalTags.includes(addForm.tagInput.trim())) {
        finalTags.push(addForm.tagInput.trim())
      }
    }

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addForm.email,
          firstName: addForm.firstName,
          lastName: addForm.lastName,
          tags: finalTags,
          listId: addForm.listId === "none" ? undefined : addForm.listId,
        }),
      })

      if (res.ok) {
        toast.success("Contact added successfully")
        setIsAddModalOpen(false)
        setAddForm({
          email: "",
          firstName: "",
          lastName: "",
          tags: [],
          listId: "none",
          tagInput: "",
        })
        fetchData(search, status, listId, page)
      } else {
        const data = await res.json()
        if (Array.isArray(data.error)) {
          toast.error(data.error[0]?.message || "Validation failed")
        } else {
          toast.error(data.error || "Failed to add contact")
        }
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  // --- Import CSV Modal State ---
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importListId, setImportListId] = useState("none")
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportSubmit = async () => {
    if (!importFile) return

    setImporting(true)
    const formData = new FormData()
    formData.append("file", importFile)
    if (importListId !== "none") {
      formData.append("listId", importListId)
    }

    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(
          `Import complete! Imported ${data.imported}, Updated ${data.updated}, Skipped ${data.skipped}`
        )
        if (data.errors?.length > 0) {
          console.warn("Import errors:", data.errors)
        }
        setIsImportModalOpen(false)
        setImportFile(null)
        fetchData(search, status, listId, page)
      } else {
        toast.error(data.error || "Import failed")
      }
    } catch (err) {
      toast.error("An error occurred during import")
    } finally {
      setImporting(false)
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    UNSUBSCRIBED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    BOUNCED: "bg-red-500/10 text-red-500 border-red-500/20",
    COMPLAINED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-full"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Contacts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <Badge
              variant="outline"
              className="border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600"
            >
              {total.toLocaleString()} total
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Dialog
              open={isImportModalOpen}
              onOpenChange={setIsImportModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-200 bg-white transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="border-gray-200 bg-white text-gray-900 sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Import Contacts</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Upload a CSV file to bulk import contacts. Ensure it has an
                    "email" column header.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center transition-colors hover:border-emerald-500/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImportFile(e.target.files[0])
                        }
                      }}
                    />
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    {importFile ? (
                      <p className="text-sm font-medium text-emerald-600">
                        {importFile.name}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          CSV files only
                        </p>
                      </>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>Add to List (Optional)</Label>
                    <Select
                      value={importListId}
                      onValueChange={setImportListId}
                    >
                      <SelectTrigger className="border-gray-200 bg-white">
                        <SelectValue placeholder="Select a list" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-200 bg-white">
                        <SelectItem value="none">No List</SelectItem>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsImportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImportSubmit}
                    disabled={!importFile || importing}
                  >
                    {importing ? "Importing..." : "Import"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="border-gray-200 bg-white text-gray-900 sm:max-w-[425px]">
                <form onSubmit={handleAddSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Create a new contact manually. Email is required.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        className="border-gray-200 bg-white"
                        value={addForm.email}
                        onChange={(e) =>
                          setAddForm({ ...addForm, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          className="border-gray-200 bg-white"
                          value={addForm.firstName}
                          onChange={(e) =>
                            setAddForm({
                              ...addForm,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          className="border-gray-200 bg-white"
                          value={addForm.lastName}
                          onChange={(e) =>
                            setAddForm({ ...addForm, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Tags</Label>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {addForm.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {tag}
                            <button
                              type="button"
                              className="ml-1 text-gray-400 hover:text-gray-900"
                              onClick={() =>
                                setAddForm({
                                  ...addForm,
                                  tags: addForm.tags.filter((t) => t !== tag),
                                })
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a tag and press Enter"
                        className="border-gray-200 bg-white"
                        value={addForm.tagInput}
                        onChange={(e) =>
                          setAddForm({ ...addForm, tagInput: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            if (
                              addForm.tagInput.trim() &&
                              !addForm.tags.includes(addForm.tagInput.trim())
                            ) {
                              setAddForm({
                                ...addForm,
                                tags: [
                                  ...addForm.tags,
                                  addForm.tagInput.trim(),
                                ],
                                tagInput: "",
                              })
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Add to List</Label>
                      <Select
                        value={addForm.listId}
                        onValueChange={(v) =>
                          setAddForm({ ...addForm, listId: v })
                        }
                      >
                        <SelectTrigger className="border-gray-200 bg-white">
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 bg-white">
                          <SelectItem value="none">No List</SelectItem>
                          {lists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Contact</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Contact KPI Cards */}
        {contactStats && (
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Active",
                value: contactStats.active.toLocaleString(),
                icon: UserCheck,
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                label: "Unsubscribed",
                value: contactStats.unsubscribed.toLocaleString(),
                icon: UserMinus,
                color: "bg-orange-50 text-orange-600",
              },
              {
                label: "Bounced",
                value: contactStats.bounced.toLocaleString(),
                icon: AlertTriangle,
                color: "bg-red-50 text-red-600",
              },
              {
                label: "Complained",
                value: contactStats.complained.toLocaleString(),
                icon: AlertTriangle,
                color: "bg-purple-50 text-purple-600",
              },
            ].map((card) => (
              <Card
                key={card.label}
                className="flex flex-col gap-3 border-gray-200/60 p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      card.color
                    )}
                  >
                    <card.icon className="size-5" />
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-[32px] leading-none font-black text-gray-900">
                    {card.value}
                  </p>
                  <p className="mt-1.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                    {card.label}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200/60 bg-white shadow-sm p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search emails or names..."
              className="border-gray-200 bg-white pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px] border-gray-200 bg-white">
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-gray-200 bg-white text-gray-900">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
                <SelectItem value="BOUNCED">Bounced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={listId} onValueChange={setListId}>
              <SelectTrigger className="w-[160px] border-gray-200 bg-white">
                <Users className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="All Lists" />
              </SelectTrigger>
              <SelectContent className="border-gray-200 bg-white text-gray-900">
                <SelectItem value="all">All Lists</SelectItem>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="flex animate-in items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-white">
                {selectedIds.size} selected
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
              >
                <Users className="mr-2 h-3 w-3" />
                Add to List
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
              >
                <Tag className="mr-2 h-3 w-3" />
                Manage Tags
              </Button>
              <Button variant="destructive" size="sm" className="ml-2 h-8">
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="relative min-h-[400px] overflow-hidden rounded-[20px] border border-gray-200/60 bg-white shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500"></div>
            </div>
          )}
          <Table>
            <TableHeader className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableRow className="border-gray-100">
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={
                      contacts.length > 0 &&
                      selectedIds.size === contacts.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="border-gray-300 data-[state=checked]:bg-emerald-500"
                  />
                </TableHead>
                <TableHead className="font-bold text-gray-900">Contact</TableHead>
                <TableHead className="font-bold text-gray-900">Status</TableHead>
                <TableHead className="font-bold text-gray-900">Engagement</TableHead>
                <TableHead className="font-bold text-gray-900">Tags</TableHead>
                <TableHead className="font-bold text-gray-900">Source</TableHead>
                <TableHead className="font-bold text-gray-900">Added</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableCell
                    colSpan={8}
                    className="h-48 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-gray-300" />
                      <p>No contacts found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="group border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.has(contact.id)}
                        onCheckedChange={() => toggleSelect(contact.id)}
                        className="border-gray-300 data-[state=checked]:bg-emerald-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-emerald-100 bg-emerald-50 text-emerald-600">
                          <AvatarFallback className="text-xs font-bold">
                            {contact.firstName
                              ? contact.firstName[0].toUpperCase()
                              : contact.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            {contact.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold uppercase",
                          statusColors[contact.status] || "bg-gray-100 text-gray-600"
                        )}
                      >
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const tier = getEngagementTier(contact)
                        return (
                          <span className={cn("flex items-center gap-1 text-xs font-medium", tier.cls)}>
                            <tier.icon className="h-3 w-3" />
                            {tier.label}
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[200px] flex-wrap gap-1">
                        {contact.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-gray-100 text-[10px] text-gray-700 hover:bg-gray-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="mt-1 align-middle text-xs text-gray-500">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                        {contact.tags.length === 0 && (
                          <span className="text-xs text-gray-400 italic">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-500 capitalize">
                      {contact.source || "api"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-gray-200 bg-white text-gray-900"
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer focus:bg-gray-50 focus:text-gray-900">
                            Edit Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer focus:bg-gray-50 focus:text-gray-900">
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-600"
                            onClick={() => {
                              window.location.href = `/user-dashboard/email/compose?to=${encodeURIComponent(contact.email)}`
                            }}
                          >
                            <Send className="mr-2 h-3.5 w-3.5" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-100" />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
                            onClick={() => handleDelete(contact.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 border-gray-200 bg-white px-2 hover:bg-gray-50 text-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="px-2 font-medium text-gray-900">{page}</span>
                <span className="text-gray-400">/</span>
                <span className="px-2">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 border-gray-200 bg-white px-2 hover:bg-gray-50 text-gray-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
