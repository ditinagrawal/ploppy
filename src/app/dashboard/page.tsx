import { DashboardOverview } from "@/components/DashboardOverview"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-medium">Dashboard</h1>
      </header>
      <div className="flex flex-1 flex-col">
        <DashboardOverview />
      </div>
    </>
  )
}
