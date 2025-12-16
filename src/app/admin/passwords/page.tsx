"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PasswordsTable,
  PasswordFormDialog,
  PasswordDetailsDialog,
  SecurityAlerts,
} from "@/modules/passwords/client"

type Password = {
  id: string
  name: string
  username: string
  url?: string
  folder: string
  strength: "strong" | "medium" | "weak"
  shared: boolean
  sharedWith: string[]
  lastModified: string
  expiresIn: number
  owner: string
  hasTotp: boolean
  totpSecret?: string
}

const passwords: Password[] = [
  {
    id: "1",
    name: "AWS Production Account",
    username: "admin@company.com",
    url: "https://console.aws.amazon.com" as string | undefined,
    folder: "Infrastructure",
    strength: "strong" as const,
    shared: true,
    sharedWith: ["DevOps Team"],
    lastModified: "2024-12-10",
    expiresIn: 45,
    owner: "John Doe",
    hasTotp: true,
    totpSecret: "JBSWY3DPEHPK3PXP" as string | undefined,
  },
  {
    id: "2",
    name: "Database Admin",
    username: "dbadmin",
    url: "postgres://prod-db.company.com:5432" as string | undefined,
    folder: "Databases",
    strength: "strong" as const,
    shared: true,
    sharedWith: ["Backend Team", "DevOps Team"],
    lastModified: "2024-12-01",
    expiresIn: 30,
    owner: "Jane Smith",
    hasTotp: false,
    totpSecret: undefined,
  },
  {
    id: "3",
    name: "GitHub Organization",
    username: "company-org",
    url: "https://github.com/company" as string | undefined,
    folder: "Development",
    strength: "medium" as const,
    shared: true,
    sharedWith: ["Development Team"],
    lastModified: "2024-11-20",
    expiresIn: 15,
    owner: "Mike Johnson",
    hasTotp: true,
    totpSecret: "HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ" as string | undefined,
  },
  {
    id: "4",
    name: "Email Marketing Platform",
    username: "marketing@company.com",
    url: "https://app.mailchimp.com" as string | undefined,
    folder: "Marketing",
    strength: "weak" as const,
    shared: true,
    sharedWith: ["Marketing Team"],
    lastModified: "2024-10-15",
    expiresIn: -5,
    owner: "Sarah Williams",
    hasTotp: false,
    totpSecret: undefined,
  },
  {
    id: "5",
    name: "SSL Certificate Private Key",
    username: "*.company.com",
    url: undefined,
    folder: "Infrastructure",
    strength: "strong" as const,
    shared: true,
    sharedWith: ["DevOps Team"],
    lastModified: "2024-12-12",
    expiresIn: 365,
    owner: "Tom Brown",
    hasTotp: false,
    totpSecret: undefined,
  },
]

export default function PasswordsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedPassword, setSelectedPassword] = React.useState<Password | null>(null)

  const handleCreateSubmit = (data: Record<string, unknown>) => {
    console.log("Create password:", data)
    setIsCreateDialogOpen(false)
  }

  const handleViewDetails = (password: Password) => {
    setSelectedPassword(password)
    setIsViewDialogOpen(true)
  }

  const securityAlerts = [
    {
      type: "weak" as const,
      count: 489,
      message: "489 passwords are using weak security. Consider updating them for better protection.",
    },
    {
      type: "expiring" as const,
      count: 34,
      message: "34 passwords will expire within the next 7 days. Update them to maintain access.",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Passwords</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize all stored passwords
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Password
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,891</div>
            <p className="text-xs text-muted-foreground">+123 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Strong Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,668</div>
            <p className="text-xs text-muted-foreground">75% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Weak Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">489</div>
            <p className="text-xs text-red-600">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      <SecurityAlerts alerts={securityAlerts} />

      <PasswordsTable passwords={passwords} onViewDetails={handleViewDetails} />

      <PasswordFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <PasswordDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        password={selectedPassword}
      />
    </div>
  )
}
