"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BotIcon, PlusIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Chatbot = {
  id: string;
  name: string;
  supportEmail: string | null;
  knowledge: string | null;
  createdAt: string;
  updatedAt: string;
};

type BillingInfo = {
  plan: "free" | "pro";
  chatbotCount: number;
  limit: number | null;
  canCreate: boolean;
};

export function DashboardOverview() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [billing, setBilling] = useState<BillingInfo | null>(null);

  useEffect(() => {
    Promise.all([
      axios.get("/api/chatbots"),
      axios.get("/api/billing"),
    ])
      .then(([botsRes, billingRes]) => {
        setChatbots(botsRes.data);
        setBilling(billingRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post("/api/chatbots", { name: newName.trim() });
      setCreateOpen(false);
      setNewName("");
      router.push(`/dashboard/${res.data.id}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.limitReached) {
        setCreateOpen(false);
        setUpgradeOpen(true);
      }
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleNewChatbotClick = () => {
    if (billing && !billing.canCreate) {
      setUpgradeOpen(true);
    } else {
      setCreateOpen(true);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await axios.post("/api/billing/checkout");
      window.location.href = res.data.url;
    } catch (error) {
      console.error(error);
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (chatbots.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BotIcon />
            </EmptyMedia>
            <EmptyTitle>No chatbots yet</EmptyTitle>
            <EmptyDescription>
              Create your first chatbot to start providing AI-powered customer
              support on your website.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={handleNewChatbotClick}>
            <PlusIcon className="mr-2 size-4" />
            Create Chatbot
          </Button>
        </Empty>

        <CreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          newName={newName}
          setNewName={setNewName}
          creating={creating}
          onCreate={handleCreate}
        />

        <UpgradeDialog
          open={upgradeOpen}
          onOpenChange={setUpgradeOpen}
          upgrading={upgrading}
          onUpgrade={handleUpgrade}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Your Chatbots
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your AI chatbots and their knowledge bases
            </p>
          </div>
          {billing && (
            <Badge variant={billing.plan === "pro" ? "default" : "secondary"}>
              {billing.plan === "pro" ? (
                <>
                  <SparklesIcon className="mr-1 size-3" />
                  Pro
                </>
              ) : (
                `${billing.chatbotCount}/${billing.limit} chatbots`
              )}
            </Badge>
          )}
        </div>
        <Button onClick={handleNewChatbotClick}>
          <PlusIcon className="mr-2 size-4" />
          New Chatbot
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chatbots.map((bot) => (
          <Card
            key={bot.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push(`/dashboard/${bot.id}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BotIcon className="size-4 text-muted-foreground" />
                {bot.name}
              </CardTitle>
              <CardDescription>
                {bot.supportEmail || "No email configured"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {bot.knowledge
                  ? bot.knowledge.substring(0, 120) +
                    (bot.knowledge.length > 120 ? "..." : "")
                  : "No knowledge base added yet"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        newName={newName}
        setNewName={setNewName}
        creating={creating}
        onCreate={handleCreate}
      />

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        upgrading={upgrading}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}

function CreateDialog({
  open,
  onOpenChange,
  newName,
  setNewName,
  creating,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newName: string;
  setNewName: (v: string) => void;
  creating: boolean;
  onCreate: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Chatbot</DialogTitle>
          <DialogDescription>
            Give your chatbot a name. You can configure its knowledge base
            after creation.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="e.g. My Store Support"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCreate()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={creating || !newName.trim()}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UpgradeDialog({
  open,
  onOpenChange,
  upgrading,
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  upgrading: boolean;
  onUpgrade: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ZapIcon className="size-5 text-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            You&apos;ve reached the 3 chatbot limit on the free plan. Upgrade to Pro
            for unlimited chatbots, priority support, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
          <p className="text-sm font-medium">Pro plan includes:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Unlimited chatbots</li>
            <li>✓ Unlimited chat sessions</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button onClick={onUpgrade} disabled={upgrading}>
            {upgrading ? "Redirecting..." : "Upgrade to Pro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
