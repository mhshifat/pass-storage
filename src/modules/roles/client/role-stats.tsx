"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RoleStat {
  label: string
  value: string
  description: string
}

interface RoleStatsProps {
  stats: RoleStat[]
}

export function RoleStats({ stats }: RoleStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

