"use client";

import { PropsWithChildren, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    Database, 
    FolderKanban, 
    ChevronRight,
    BarChart3,
    Settings,
    User,
    LogOut,
    ChevronDown,
    HelpCircle,
    Bell,
    Search,
    Moon,
    Sun,
    Zap,
    Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Connections", href: "/admin/connections", icon: Database },
    { name: "Projects", href: "/admin/projects", icon: FolderKanban },
];

const secondaryNavigation = [
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Get current page info
    const getCurrentPage = () => {
        if (pathname?.includes('/dashboard')) return { title: 'Dashboard', icon: LayoutDashboard };
        if (pathname?.includes('/connections')) return { title: 'Connections', icon: Database };
        if (pathname?.includes('/projects')) return { title: 'Projects', icon: FolderKanban };
        if (pathname?.includes('/analytics')) return { title: 'Analytics', icon: BarChart3 };
        if (pathname?.includes('/settings')) return { title: 'Settings', icon: Settings };
        return { title: 'Dashboard', icon: LayoutDashboard };
    };

    const currentPage = getCurrentPage();

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className={cn(
                "border-r border-border/40 bg-card flex flex-col transition-all duration-300 overflow-hidden",
                isCollapsed ? "w-20" : "w-72"
            )}>
                {/* Logo/Brand Section */}
                <div className={cn(
                    "h-16 flex items-center border-b border-border/40 shrink-0 transition-all duration-300",
                    isCollapsed ? "justify-center" : "px-6"
                )}>
                    <div className={cn(
                        "flex items-center transition-all duration-300",
                        isCollapsed ? "gap-0" : "gap-3"
                    )}>
                        <div className="rounded-lg bg-linear-to-br from-primary to-primary/60 p-2 shrink-0">
                            <BarChart3 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className={cn(
                            "min-w-0 overflow-hidden transition-all duration-300",
                            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        )}>
                            <h1 className="font-bold text-lg tracking-tight whitespace-nowrap">Profit Insights</h1>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
                    <div className="space-y-1">
                        <p className={cn(
                            "px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap transition-opacity duration-300",
                            isCollapsed ? "opacity-0 h-0 mb-0" : "opacity-100"
                        )}>
                            Main Menu
                        </p>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-lg text-sm font-medium transition-all group overflow-hidden",
                                        isCollapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5 gap-3",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-transform group-hover:scale-110 shrink-0",
                                        isActive && "text-primary-foreground"
                                    )} />
                                    <span className={cn(
                                        "whitespace-nowrap overflow-hidden transition-all duration-300",
                                        isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3 flex-1"
                                    )}>{item.name}</span>
                                    <ChevronRight className={cn(
                                        "shrink-0 text-primary-foreground transition-all duration-300",
                                        !isActive || isCollapsed ? "w-0 h-0 opacity-0 ml-0" : "w-4 h-4 opacity-100 ml-auto"
                                    )} />
                                </Link>
                            );
                        })}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-1">
                        <p className={cn(
                            "px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap transition-opacity duration-300",
                            isCollapsed ? "opacity-0 h-0 mb-0" : "opacity-100"
                        )}>
                            Tools
                        </p>
                        {secondaryNavigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-lg text-sm font-medium transition-all group overflow-hidden",
                                        isCollapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5 gap-3",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-transform group-hover:scale-110 shrink-0",
                                        isActive && "text-primary-foreground"
                                    )} />
                                    <span className={cn(
                                        "whitespace-nowrap overflow-hidden transition-all duration-300",
                                        isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3 flex-1"
                                    )}>{item.name}</span>
                                    <ChevronRight className={cn(
                                        "shrink-0 text-primary-foreground transition-all duration-300",
                                        !isActive || isCollapsed ? "w-0 h-0 opacity-0 ml-0" : "w-4 h-4 opacity-100 ml-auto"
                                    )} />
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile Section */}
                {!isCollapsed ? (
                    <div className="border-t border-border/40 bg-muted/20">
                        {/* Quick Actions */}
                        <div className="px-4 py-3 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-muted/80"
                                title="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-muted/80"
                                title="Help & Support"
                            >
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                            <div className="flex-1" />
                            <div className="text-xs text-muted-foreground">
                                v1.0.0
                            </div>
                        </div>
                        
                        <Separator />
                        
                        {/* User Profile */}
                        <div className="p-3">
                            <div 
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/80 cursor-pointer transition-colors group relative"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="rounded-full bg-linear-to-br from-primary to-primary/60 p-2 ring-2 ring-primary/20">
                                    <User className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">Admin User</p>
                                    <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
                                </div>
                                <ChevronDown className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform",
                                    showUserMenu && "rotate-180"
                                )} />
                            </div>
                            
                            {/* User Menu Dropdown */}
                            {showUserMenu && (
                                <div className="mt-2 space-y-1 animate-in fade-in-0 slide-in-from-top-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Profile Settings
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Preferences
                                    </Button>
                                    <Separator className="my-1" />
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-3 border-t border-border/40 space-y-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-full h-10 rounded-lg hover:bg-muted/80"
                            title="Notifications"
                        >
                            <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-full h-10 rounded-lg hover:bg-muted/80"
                            title="Help & Support"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                        <Separator />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-full h-12 rounded-lg bg-muted/50 hover:bg-muted/80"
                            title="Admin User"
                        >
                            <div className="rounded-full bg-linear-to-br from-primary to-primary/60 p-1.5">
                                <User className="h-3 w-3 text-primary-foreground" />
                            </div>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background">
                {/* Header */}
                <header className="sticky top-0 z-10 border-b border-border/40 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
                    <div className="flex h-16 items-center gap-4 px-6 justify-between">
                        {/* Sidebar Toggle & Page Title */}
                        <div className="flex items-center gap-3 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                title="Toggle Sidebar"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="rounded-lg bg-primary/10 p-2">
                                <currentPage.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">{currentPage.title}</h2>
                            </div>
                        </div>

                        {/* Search Bar - Centered */}
                        <div className="hidden md:flex items-center justify-center flex-1 max-w-2xl mx-auto">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                />
                                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border/40 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Quick Action Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                title="Quick Actions"
                            >
                                <Zap className="h-4 w-4" />
                            </Button>

                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                title="Toggle Theme"
                            >
                                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>

                            {/* Notifications */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg relative"
                                title="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
                            </Button>

                            <Separator orientation="vertical" className="h-6" />

                            {/* User Avatar */}
                            <div className="flex items-center gap-3 pl-2">
                                <div className="hidden lg:block text-right">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">admin@example.com</p>
                                </div>
                                <div className="rounded-full bg-linear-to-br from-primary to-primary/60 p-2 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all">
                                    <User className="h-4 w-4 text-primary-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    )
}