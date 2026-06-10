"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Key,
  Plus,
  Shield,
  Trash2,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiKey {
  id: string
  name: string
  maskedKey: string
  lastUsed: string | null
  createdAt: string
}

interface NotificationPrefs {
  campaignSummary: boolean
  bounceAlerts: boolean
  newSubscriber: boolean
  weeklyReport: boolean
}

// ─── Mock data — replace with real API calls ──────────────────────────────────
const MOCK_PLAN = {
  name: "Pro",
  price: "$29/mo",
  renewalDate: "Jul 29, 2026",
  features: [
    "50,000 emails / month",
    "Unlimited workflows",
    "Full AI suite",
    "Priority support",
    "150+ integrations",
    "A/B testing",
  ],
  contactsUsed: 3_420,
  contactsLimit: 10_000,
  emailsSent: 18_750,
  emailsLimit: 50_000,
}

const MOCK_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production",
    maskedKey: "sk_live_...a3f9",
    lastUsed: "2 hours ago",
    createdAt: "Jan 12, 2026",
  },
  {
    id: "key_2",
    name: "Staging",
    maskedKey: "sk_test_...b7c2",
    lastUsed: "3 days ago",
    createdAt: "Mar 5, 2026",
  },
]

// ─── General Tab ─────────────────────────────────────────────────────────────
function GeneralTab() {
  const { user } = useUser()
  const [name, setName] = useState(user?.fullName ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: PATCH /api/user
      await new Promise((r) => setTimeout(r, 600))
      toast.success("Profile updated")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const initials = (
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0] ??
    "U"
  ).toUpperCase()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your display name and view your account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.imageUrl} alt={name} />
              <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">
                {name || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Avatar managed via Clerk
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="max-w-sm"
            />
          </div>

          {/* Email — read-only from Clerk */}
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="flex max-w-sm items-center gap-2">
              <Input
                id="email"
                value={user?.emailAddresses?.[0]?.emailAddress ?? ""}
                readOnly
                className="bg-muted text-muted-foreground"
              />
              <Badge variant="outline" className="shrink-0 text-xs">
                Verified
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Email is managed by your Clerk account.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-fit">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Billing Tab ─────────────────────────────────────────────────────────────
function BillingTab() {
  const plan = MOCK_PLAN
  const contactsPct = Math.round((plan.contactsUsed / plan.contactsLimit) * 100)
  const emailsPct = Math.round((plan.emailsSent / plan.emailsLimit) * 100)

  const handleUpgrade = async () => {
    try {
      // TODO: POST /api/stripe/checkout
      toast.info("Redirecting to checkout…")
    } catch {
      toast.error("Failed to start checkout")
    }
  }

  const handlePortal = async () => {
    try {
      // TODO: POST /api/stripe/portal
      toast.info("Redirecting to Stripe portal…")
    } catch {
      toast.error("Failed to open portal")
    }
  }

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>
                Your subscription renews on {plan.renewalDate}.
              </CardDescription>
            </div>
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              {plan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground">
              {plan.price}
            </span>
            <span className="text-sm text-muted-foreground">
              billed monthly
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-2">
            {plan.features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={handleUpgrade} size="sm">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Upgrade Plan
            </Button>
            <Button variant="outline" size="sm" onClick={handlePortal}>
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage meters */}
      <Card>
        <CardHeader>
          <CardTitle>Usage this month</CardTitle>
          <CardDescription>Resets on the 1st of each month.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Contacts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Contacts</span>
              <span className="text-muted-foreground">
                {plan.contactsUsed.toLocaleString()} /{" "}
                {plan.contactsLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={contactsPct} className="h-2" />
            <p className="text-xs text-muted-foreground">{contactsPct}% used</p>
          </div>

          {/* Emails */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Emails sent</span>
              <span className="text-muted-foreground">
                {plan.emailsSent.toLocaleString()} /{" "}
                {plan.emailsLimit.toLocaleString()}
              </span>
            </div>
            <Progress
              value={emailsPct}
              className={cn("h-2", emailsPct >= 90 && "[&>div]:bg-destructive")}
            />
            <p className="text-xs text-muted-foreground">{emailsPct}% used</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Email Tab ────────────────────────────────────────────────────────────────
function EmailTab() {
  const [fromName, setFromName] = useState("Autonity")
  const [replyTo, setReplyTo] = useState("")
  const [footerText, setFooterText] = useState(
    "You are receiving this email because you subscribed to our list. Unsubscribe at any time."
  )
  const [domain, setDomain] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Email settings saved")
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Sender defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Sender defaults</CardTitle>
          <CardDescription>
            These values are used as defaults for all campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="from-name">From name</Label>
            <Input
              id="from-name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Your Company"
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reply-to">Reply-to email</Label>
            <Input
              id="reply-to"
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="hello@yourcompany.com"
              className="max-w-sm"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="footer">Unsubscribe footer text</Label>
            <Textarea
              id="footer"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              rows={3}
              className="max-w-lg resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Appended to the bottom of every email. Required by CAN-SPAM.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-fit">
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Sending domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Sending domain
          </CardTitle>
          <CardDescription>
            Add a custom sending domain to improve deliverability and brand
            trust.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="mail.yourcompany.com"
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={() => {
                if (!domain) return toast.error("Enter a domain first")
                toast.success(
                  `Domain "${domain}" added — DNS records will appear here.`
                )
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add domain
            </Button>
          </div>

          {/* DNS records placeholder */}
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
            <Globe className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">
              No sending domains yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a domain above to see the DNS records you need to configure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────
function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!newKeyName.trim()) return toast.error("Enter a key name")
    setCreating(true)
    try {
      // TODO: POST /api/keys
      await new Promise((r) => setTimeout(r, 700))
      const fakeKey = `sk_live_${Math.random().toString(36).slice(2, 18)}`
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        name: newKeyName.trim(),
        maskedKey: `sk_live_...${fakeKey.slice(-4)}`,
        lastUsed: null,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
      setKeys((prev) => [newKey, ...prev])
      setCreatedKey(fakeKey)
      setNewKeyName("")
      setShowDialog(true)
    } catch {
      toast.error("Failed to create key")
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
    toast.success("API key revoked")
  }

  const handleCopy = () => {
    if (!createdKey) return
    navigator.clipboard.writeText(createdKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                API Keys
              </CardTitle>
              <CardDescription>
                Use API keys to authenticate requests from your application.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create new key */}
          <div className="flex gap-2">
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Production)"
              className="max-w-xs"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={creating}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {creating ? "Creating…" : "Create API Key"}
            </Button>
          </div>

          {/* Keys table */}
          {keys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Key className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">
                No API keys yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first key above to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold tracking-wide uppercase">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide uppercase">
                      Key
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide uppercase">
                      Last used
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-wide uppercase">
                      Created
                    </TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {key.name}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          {key.maskedKey}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.lastUsed ?? "Never"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRevoke(key.id)}
                          title="Revoke key"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New key reveal dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              API key created
            </DialogTitle>
            <DialogDescription>
              Copy this key now — it will{" "}
              <span className="font-semibold text-destructive">
                never be shown again
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-3">
            <code className="flex-1 font-mono text-xs break-all text-foreground">
              {createdKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDialog(false)} className="w-full">
              Done — I&apos;ve saved my key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    campaignSummary: true,
    bounceAlerts: true,
    newSubscriber: false,
    weeklyReport: true,
  })
  const [saving, setSaving] = useState(false)

  const toggle = (key: keyof NotificationPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Notification preferences saved")
    setSaving(false)
  }

  const items: {
    key: keyof NotificationPrefs
    label: string
    description: string
  }[] = [
    {
      key: "campaignSummary",
      label: "Campaign sent summary",
      description:
        "Receive a summary email after each campaign is sent, including open and click stats.",
    },
    {
      key: "bounceAlerts",
      label: "Bounce alerts",
      description:
        "Get notified when your bounce rate exceeds 2% on a campaign.",
    },
    {
      key: "newSubscriber",
      label: "New subscriber",
      description:
        "Receive a notification each time someone subscribes to your list.",
    },
    {
      key: "weeklyReport",
      label: "Weekly report",
      description:
        "A weekly digest of your email performance, list growth, and top campaigns.",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>
            Choose which emails Autonity sends to your account address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {items.map((item, i) => (
            <div key={item.key}>
              <div className="flex items-start justify-between gap-4 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={prefs[item.key]}
                  onCheckedChange={() => toggle(item.key)}
                  className="shrink-0"
                />
              </div>
              {i < items.length - 1 && <Separator className="opacity-50" />}
            </div>
          ))}

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving} className="w-fit">
              {saving ? "Saving…" : "Save preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
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
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account, billing, email configuration, and preferences.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-muted p-1">
            {["general", "billing", "email", "api-keys", "notifications"].map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-lg px-4 py-1.5 text-sm capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tab === "api-keys"
                    ? "API Keys"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              )
            )}
          </TabsList>

          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>

          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>

          <TabsContent value="email">
            <EmailTab />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeysTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
