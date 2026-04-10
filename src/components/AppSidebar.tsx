"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BotIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

type Chatbot = {
  id: string
  ownerId: string
  name: string
  supportEmail: string | null
  knowledge: string | null
  createdAt: string
  updatedAt: string
}

export function AppSidebar({ user }: { user: { email: string; id: string } | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [plan, setPlan] = useState<"free" | "pro" | null>(null)

  const fetchChatbots = async () => {
    try {
      const res = await axios.get("/api/chatbots")
      setChatbots(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChatbots()
    axios.get("/api/billing").then((res) => setPlan(res.data.plan)).catch(() => {})
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await axios.post("/api/chatbots", { name: newName.trim() })
      setChatbots((prev) => [...prev, res.data])
      setCreateOpen(false)
      setNewName("")
      router.push(`/dashboard/${res.data.id}`)
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await axios.delete(`/api/chatbots/${deleteId}`)
      setChatbots((prev) => prev.filter((c) => c.id !== deleteId))
      if (pathname === `/dashboard/${deleteId}`) {
        router.push("/dashboard")
      }
      setDeleteId(null)
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout")
      window.location.href = "/"
    } catch (error) {
      console.error(error)
    }
  }

  const activeChatbotId = pathname.startsWith("/dashboard/")
    ? pathname.split("/dashboard/")[1]?.split("/")[0]
    : null

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BotIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Ploppy</span>
                  <span className="truncate text-xs text-muted-foreground">Dashboard</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Chatbots</SidebarGroupLabel>
            <SidebarGroupAction onClick={() => setCreateOpen(true)} title="Create chatbot">
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {loading ? (
                  <>
                    <SidebarMenuSkeleton showIcon />
                    <SidebarMenuSkeleton showIcon />
                    <SidebarMenuSkeleton showIcon />
                  </>
                ) : chatbots.length === 0 ? (
                  <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                    No chatbots yet. Create one to get started.
                  </div>
                ) : (
                  chatbots.map((bot) => (
                    <SidebarMenuItem key={bot.id}>
                      <SidebarMenuButton
                        isActive={activeChatbotId === bot.id}
                        onClick={() => router.push(`/dashboard/${bot.id}`)}
                        tooltip={bot.name}
                        className="cursor-pointer"
                      >
                        <BotIcon className="size-4" />
                        <span>{bot.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted font-semibold text-sm">
                      {user?.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.email ?? "User"}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {plan === "pro" ? "Pro plan" : "Free plan"}
                      </span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  <DropdownMenuItem onClick={() => router.push("/")}>
                    <SettingsIcon className="mr-2 size-4" />
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {plan === "pro" ? (
                    <DropdownMenuItem
                      onClick={() => window.location.href = "/api/billing/portal"}
                    >
                      <SparklesIcon className="mr-2 size-4" />
                      Manage Billing
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={async () => {
                        const res = await axios.post("/api/billing/checkout")
                        window.location.href = res.data.url
                      }}
                    >
                      <ZapIcon className="mr-2 size-4 text-yellow-500" />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Chatbot</DialogTitle>
            <DialogDescription>
              Give your chatbot a name. You can configure its knowledge base after creation.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. My Store Support"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chatbot</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone. The chatbot and all its knowledge will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
