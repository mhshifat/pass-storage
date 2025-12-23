"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Pencil, Trash2, Users, FolderKey } from "lucide-react"
import { TeamsEmptyState } from "./teams-empty-state"
import { usePermissions } from "@/hooks/use-permissions"
import { useIsMobile } from "@/hooks/use-mobile"

interface Team {
  id: string
  name: string
  description: string | null
  members: number
  passwords: number
  createdAt: string
  manager: string
}

interface TeamsTableProps {
  teams: Team[]
  onViewMembers: (team: Team) => void
  onEdit?: (team: Team) => void
  onDelete?: (teamId: string) => void
  onCreateTeam?: () => void
  onManagePasswords?: (team: Team) => void
}

export function TeamsTable({
  teams,
  onViewMembers,
  onEdit,
  onDelete,
  onCreateTeam,
  onManagePasswords,
}: TeamsTableProps) {
  const { t } = useTranslation()
  const { hasPermission } = usePermissions()
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const isSearching = searchQuery.length > 0 && filteredTeams.length === 0
  const isEmpty = teams.length === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("teams.searchTeams")}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty || isSearching ? (
          <TeamsEmptyState onCreateTeam={onCreateTeam} isSearching={isSearching} />
        ) : isMobile ? (
          // Mobile card layout
          <div className="space-y-4 md:hidden">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{team.name}</div>
                      {team.description && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {team.description}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewMembers(team)}>
                          <Users className="mr-2 h-4 w-4" />
                          {t("teams.viewMembers")}
                        </DropdownMenuItem>
                        {hasPermission("team.edit") && (
                          <DropdownMenuItem onClick={() => onEdit?.(team)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("teams.editTeam")}
                          </DropdownMenuItem>
                        )}
                        {hasPermission("password.share") && (
                          <DropdownMenuItem onClick={() => onManagePasswords?.(team)}>
                            <FolderKey className="mr-2 h-4 w-4" />
                            {t("teams.managePasswords")}
                          </DropdownMenuItem>
                        )}
                        {hasPermission("team.delete") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => onDelete?.(team.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("teams.deleteTeam")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("teams.manager")}:</span>
                      <span className="text-sm">{team.manager}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("teams.members")}:</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{team.members}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("teams.passwords")}:</span>
                      <div className="flex items-center gap-1">
                        <FolderKey className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{team.passwords}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("teams.created")}:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("teams.teamName")}</TableHead>
                <TableHead>{t("teams.manager")}</TableHead>
                <TableHead>{t("teams.members")}</TableHead>
                <TableHead>{t("teams.passwords")}</TableHead>
                <TableHead>{t("teams.created")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{team.name}</div>
                      {team.description && (
                        <div className="text-sm text-muted-foreground">{team.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{team.manager}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{team.members}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FolderKey className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{team.passwords}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(team.createdAt).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => onViewMembers(team)}>
                          <Users className="mr-2 h-4 w-4" />
                          {t("teams.viewMembers")}
                        </DropdownMenuItem>
                        {hasPermission("team.edit") && (
                          <DropdownMenuItem onClick={() => onEdit?.(team)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("teams.editTeam")}
                          </DropdownMenuItem>
                        )}
                        {hasPermission("password.share") && (
                          <DropdownMenuItem onClick={() => onManagePasswords?.(team)}>
                            <FolderKey className="mr-2 h-4 w-4" />
                            {t("teams.managePasswords")}
                          </DropdownMenuItem>
                        )}
                        {hasPermission("team.delete") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => onDelete?.(team.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("teams.deleteTeam")}
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

