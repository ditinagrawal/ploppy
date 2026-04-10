"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckIcon,
  ClipboardIcon,
  SettingsIcon,
  BookOpenIcon,
  CodeIcon,
  Trash2Icon,
  GlobeIcon,
  Loader2Icon,
  MessageSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react"

type Chatbot = {
  id: string
  ownerId: string
  name: string
  supportEmail: string | null
  knowledge: string | null
  createdAt: string
  updatedAt: string
}

type ChatSession = {
  id: string
  chatbotId: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

type Message = {
  id: string
  sessionId: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export function ChatbotSettings({ chatbotId }: { chatbotId: string }) {
  const router = useRouter()
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const [name, setName] = useState("")
  const [supportEmail, setSupportEmail] = useState("")
  const [knowledge, setKnowledge] = useState("")
  const [scrapeUrl, setScrapeUrl] = useState("")
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState("")

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [sessionMessages, setSessionMessages] = useState<Record<string, Message[]>>({})
  const [loadingMessages, setLoadingMessages] = useState<Record<string, boolean>>({})

  useEffect(() => {
    axios
      .get(`/api/chatbots/${chatbotId}`)
      .then((res) => {
        setChatbot(res.data)
        setName(res.data.name || "")
        setSupportEmail(res.data.supportEmail || "")
        setKnowledge(res.data.knowledge || "")
      })
      .catch((err) => {
        console.error(err)
        if (err.response?.status === 404) {
          router.push("/dashboard")
        }
      })
      .finally(() => setLoading(false))
  }, [chatbotId, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await axios.patch(`/api/chatbots/${chatbotId}`, {
        name,
        supportEmail,
        knowledge,
      })
      setChatbot(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await axios.delete(`/api/chatbots/${chatbotId}`)
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  const fetchSessions = async () => {
    setSessionsLoading(true)
    try {
      const res = await axios.get(`/api/chatbots/${chatbotId}/sessions`)
      setSessions(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setSessionsLoading(false)
    }
  }

  const toggleSession = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null)
      return
    }
    setExpandedSession(sessionId)
    if (sessionMessages[sessionId]) return
    setLoadingMessages((prev) => ({ ...prev, [sessionId]: true }))
    try {
      const res = await axios.get(`/api/chatbots/${chatbotId}/sessions/${sessionId}`)
      setSessionMessages((prev) => ({ ...prev, [sessionId]: res.data.messages }))
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingMessages((prev) => ({ ...prev, [sessionId]: false }))
    }
  }

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return
    setScraping(true)
    setScrapeError("")
    try {
      const res = await axios.post("/api/scrape", { url: scrapeUrl.trim() })
      const scraped = res.data.content as string
      if (scraped) {
        setKnowledge((prev) => (prev ? prev + "\n\n" + scraped : scraped))
        setScrapeUrl("")
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setScrapeError(error.response?.data?.message || "Failed to scrape URL")
      } else {
        setScrapeError("Failed to scrape URL")
      }
    } finally {
      setScraping(false)
    }
  }

  const embedCode = `<script
  src="${process.env.NEXT_PUBLIC_APP_URL || "https://yoursite.com"}/chatBot.js"
  data-chatbot-id="${chatbotId}">
</script>`

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!chatbot) return null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {chatbot.name}
            </h2>
            <Badge variant="secondary">Chatbot</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your chatbot settings and knowledge base
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2Icon className="mr-2 size-4" />
          Delete
        </Button>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">
            <SettingsIcon className="mr-1.5 size-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <BookOpenIcon className="mr-1.5 size-3.5" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="embed">
            <CodeIcon className="mr-1.5 size-3.5" />
            Embed
          </TabsTrigger>
          <TabsTrigger value="chats" onClick={fetchSessions}>
            <MessageSquareIcon className="mr-1.5 size-3.5" />
            Chats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Basic information about the business this chatbot represents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Chatbot Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. My Store Support"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Support Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="support@yourbusiness.com"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrape-url">Import Knowledge from URL</Label>
                <p className="text-xs text-muted-foreground">
                  Enter a website URL to scrape its content and append it to the knowledge base
                </p>
                <div className="flex gap-2">
                  <Input
                    id="scrape-url"
                    type="url"
                    placeholder="https://example.com/about"
                    value={scrapeUrl}
                    onChange={(e) => {
                      setScrapeUrl(e.target.value)
                      setScrapeError("")
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                    disabled={scraping}
                  />
                  <Button
                    variant="outline"
                    onClick={handleScrape}
                    disabled={scraping || !scrapeUrl.trim()}
                  >
                    {scraping ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <GlobeIcon className="mr-2 size-4" />
                        Scrape
                      </>
                    )}
                  </Button>
                </div>
                {scrapeError && (
                  <p className="text-xs text-destructive">{scrapeError}</p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                {saved && (
                  <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <CheckIcon className="size-4" />
                    Saved
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Add FAQs, policies, delivery info, refunds, and anything your
                chatbot should know. The AI will only answer based on this
                information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Example:
- Refund policy: 7 days return available
- Delivery time: 3-5 working days
- Cash on Delivery available
- Support hours: Mon-Fri 9am-6pm`}
                className="min-h-[240px]"
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Knowledge"}
                </Button>
                {saved && (
                  <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                    <CheckIcon className="size-4" />
                    Saved
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>Embed Script</CardTitle>
              <CardDescription>
                Copy and paste this code before the closing &lt;/body&gt; tag of
                your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100 font-mono overflow-x-auto">
                  {embedCode}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={copyCode}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="mr-1 size-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="mr-1 size-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Installation Steps</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Copy the embed script above</li>
                  <li>
                    Paste it before the closing{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      &lt;/body&gt;
                    </code>{" "}
                    tag
                  </li>
                  <li>Reload your website</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Live Preview</h3>
                <p className="text-sm text-muted-foreground">
                  This is how the chatbot will appear on your website
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <div className="flex items-center gap-2 px-4 h-9 bg-muted border-b">
                    <span className="size-2.5 rounded-full bg-red-400" />
                    <span className="size-2.5 rounded-full bg-yellow-400" />
                    <span className="size-2.5 rounded-full bg-green-400" />
                    <span className="ml-4 text-xs text-muted-foreground">
                      your-website.com
                    </span>
                  </div>
                  <div className="relative h-64 p-6 text-muted-foreground text-sm bg-background">
                    Your website content goes here

                    <div className="absolute bottom-24 right-6 w-64 bg-card rounded-xl shadow-lg border overflow-hidden">
                      <div className="bg-primary text-primary-foreground text-xs px-3 py-2 flex justify-between items-center">
                        <span>Customer Support</span>
                        <span className="cursor-default">x</span>
                      </div>
                      <div className="p-3 space-y-2 bg-muted/50">
                        <div className="bg-muted text-foreground text-xs px-3 py-2 rounded-lg w-fit">
                          Hi! How can I help you?
                        </div>
                        <div className="bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg ml-auto w-fit">
                          What is the return policy?
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl text-lg">
                      💬
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Chat Sessions</CardTitle>
              <CardDescription>
                Conversations visitors have had with your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquareIcon className="size-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chats from your embedded widget will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                        onClick={() => toggleSession(session.id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedSession === session.id ? (
                            <ChevronDownIcon className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="size-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              Session{" "}
                              <span className="font-mono text-xs text-muted-foreground">
                                {session.id.slice(0, 8)}…
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {session.messageCount} message{session.messageCount !== 1 ? "s" : ""}
                        </Badge>
                      </button>

                      {expandedSession === session.id && (
                        <div className="border-t bg-muted/20 p-4 space-y-3">
                          {loadingMessages[session.id] ? (
                            <div className="space-y-2">
                              <Skeleton className="h-8 w-3/4" />
                              <Skeleton className="h-8 w-1/2 ml-auto" />
                            </div>
                          ) : (sessionMessages[session.id] || []).length === 0 ? (
                            <p className="text-xs text-muted-foreground">No messages</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {(sessionMessages[session.id] || []).map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                      msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-muted text-foreground rounded-tl-sm"
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chatbot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{chatbot.name}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
