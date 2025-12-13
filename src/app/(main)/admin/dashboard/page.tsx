"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FolderKanban, Layout, Layers, TrendingUp, Activity, Clock, LucideIcon } from "lucide-react";
import Link from "next/link";

function formatDistanceToNow(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];
    
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    
    return 'just now';
}

function StatCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend 
}: { 
    title: string; 
    value: number; 
    description: string; 
    icon: LucideIcon; 
    trend?: { value: string; isPositive: boolean } 
}) {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <div className="p-2 rounded-lg bg-linear-to-br from-primary/10 to-primary/20 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-1">
                    <div className="text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {value.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <TrendingUp className={`h-3 w-3 ${!trend.isPositive && 'rotate-180'}`} />
                            {trend.value}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ActivityItem({ 
    title, 
    type, 
    createdAt, 
    href 
}: { 
    title: string; 
    type: 'project' | 'connection'; 
    createdAt: Date; 
    href: string;
}) {
    const Icon = type === 'project' ? FolderKanban : Database;
    
    return (
        <Link href={href} className="block group">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(createdAt))}
                    </div>
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                    {type}
                </div>
            </div>
        </Link>
    );
}

export default function AdminDashboardPage() {
    const trpc = useTRPC();
    const { data, isLoading } = useSuspenseQuery(trpc.dashboard.getStats.queryOptions());

    if (isLoading || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
            </div>
        );
    }

    const { overview, recentActivity, projectsWithGroups } = data;

    return (
        <div className="space-y-8 p-8">
            {/* Overview Stats */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Projects"
                        value={overview.totalProjects}
                        description="Active projects in your workspace"
                        icon={FolderKanban}
                    />
                    <StatCard
                        title="Connections"
                        value={overview.totalConnections}
                        description="Data source connections"
                        icon={Database}
                    />
                    <StatCard
                        title="Table Groups"
                        value={overview.totalTableGroups}
                        description="Organized data groups"
                        icon={Layout}
                    />
                    <StatCard
                        title="Merge Groups"
                        value={overview.totalMergeGroups}
                        description="Combined table groups"
                        icon={Layers}
                    />
                </div>
            </div>

            {/* Recent Activity & Top Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="border-primary/20 pt-0 overflow-hidden">
                    <CardHeader className="pt-6 bg-linear-to-r from-primary/5 to-primary/10 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />Recent Activity
                        </CardTitle>
                        <CardDescription>Latest projects and connections</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            {[
                                ...recentActivity.projects.map((p) => ({
                                    title: p.name,
                                    type: 'project' as const,
                                    createdAt: p.created_at,
                                    href: `/admin/projects/${p.id}`
                                })), 
                                ...recentActivity.connections.map((c) => ({
                                    title: c.name,
                                    type: 'connection' as const,
                                    createdAt: c.created_at,
                                    href: '/admin/connections'
                                }))
                            ]
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 8)
                                .map((item, idx) => (
                                    <ActivityItem key={idx} {...item} />
                                ))}
                            {recentActivity.projects.length === 0 && recentActivity.connections.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Project Analytics */}
                <Card className="border-primary/20 pt-0 overflow-hidden">
                    <CardHeader className="pt-6 bg-linear-to-r from-primary/5 to-primary/10 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />Project Analytics
                        </CardTitle>
                        <CardDescription>Projects with group statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            {projectsWithGroups.slice(0, 8).map((project) => (
                                <Link 
                                    key={project.id} 
                                    href={`/admin/projects/${project.id}`}
                                    className="block group"
                                >
                                    <div className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate group-hover:text-primary transition-colors">
                                                    {project.name}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Layout className="h-3 w-3" />
                                                        <span>{project._count.tableGroups} groups</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Layers className="h-3 w-3" />
                                                        <span>{project._count.mergeGroups} merges</span>
                                                    </div>
                                                </div>
                                            </div>
                            <div className="ml-3">
                                                <div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                                                    {project._count.tableGroups + project._count.mergeGroups}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {projectsWithGroups.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No projects yet. Create your first project to get started!
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-primary/20 pt-0 overflow-hidden">
                <CardHeader className="pt-6 bg-linear-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />Quick Actions
                    </CardTitle>
                    <CardDescription>Get started with common tasks</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link 
                            href="/admin/projects" 
                            className="group p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                            <FolderKanban className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                Create Project
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Start a new data analysis project
                            </p>
                        </Link>
                        <Link 
                            href="/admin/connections" 
                            className="group p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                            <Database className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                Add Connection
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Connect a new data source
                            </p>
                        </Link>
                        <Link 
                            href="/admin/projects" 
                            className="group p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                            <Layers className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                Manage Groups
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Organize and merge table groups
                            </p>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
