import { getSession } from "@/lib/getSession"
import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <AppSidebar user={{ email: session.user.email, id: session.user.id }} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
