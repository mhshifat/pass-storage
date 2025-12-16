"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "@/components/shared/sidebar"
import { Logo } from "@/components/shared/logo"
import { cn } from "@/lib/utils"
import { getUserData } from "./actions"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [user, setUser] = React.useState<{
    id: string
    name: string
    email: string
    role: string
  } | null>(null)

  React.useEffect(() => {
    getUserData().then(setUser)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-card lg:block transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <AppSidebar user={user} isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold">PassStorage</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <AppSidebar user={user} isCollapsed={false} onToggleCollapse={() => {}} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
