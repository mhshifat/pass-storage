"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Search, MoreHorizontal, Pencil, Trash2, Shield } from "lucide-react"
import { RolesEmptyState } from "./roles-empty-state"
import { usePermissions } from "@/hooks/use-permissions"

interface Role {
  id: string
  name: string
  description: string | null
  users: number
  isSystem: boolean
  createdAt: string
}

interface RolesTableProps {
  roles: Role[]
  onViewPermissions: (role: Role) => void
  onEdit?: (role: Role) => void
  onDelete?: (role: Role) => void
  onCreateRole?: () => void
}

export function RolesTable({ roles, onViewPermissions, onEdit, onDelete, onCreateRole }: RolesTableProps) {
  const { t } = useTranslation()
  const { hasPermission } = usePermissions()
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("roles.searchRoles")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRoles.length === 0 ? (
          <RolesEmptyState 
            onCreateRole={onCreateRole}
            isSearching={searchQuery.length > 0}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("roles.roleName")}</TableHead>
                <TableHead>{t("roles.type")}</TableHead>
                <TableHead>{t("audit.user")}</TableHead>
                <TableHead>{t("roles.created")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.name}</span>
                      </div>
                      {role.description ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm text-muted-foreground mt-1 truncate max-w-md cursor-help">
                              {role.description}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            className="max-w-md whitespace-normal"
                            side="bottom"
                            align="start"
                          >
                            {role.description}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="text-sm text-muted-foreground mt-1 italic">
                          {t("roles.noDescription")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.isSystem ? "secondary" : "default"}>
                      {role.isSystem ? t("roles.system") : t("roles.custom")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{role.users}</span>
                    <span className="text-sm text-muted-foreground"> {t("roles.users")}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewPermissions(role)}>
                          <Shield className="mr-2 h-4 w-4" />
                          {t("roles.viewPermissions")}
                        </DropdownMenuItem>
                        {hasPermission("role.manage") && (
                          <DropdownMenuItem
                            disabled={role.isSystem}
                            onClick={() => onEdit && onEdit(role)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("roles.editRole")}
                          </DropdownMenuItem>
                        )}
                        {hasPermission("role.manage") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={role.isSystem}
                              className="text-red-600"
                              onClick={() => onDelete && onDelete(role)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("roles.deleteRole")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
