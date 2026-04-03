import { ChatbotSettings } from "@/components/ChatbotSettings"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function ChatbotPage({
  params,
}: {
  params: Promise<{ chatbotId: string }>
}) {
  const { chatbotId } = await params

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-medium">Chatbot Settings</h1>
      </header>
      <div className="flex flex-1 flex-col">
        <ChatbotSettings chatbotId={chatbotId} />
      </div>
    </>
  )
}
