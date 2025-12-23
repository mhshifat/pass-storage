"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const { t } = useTranslation()

  const shortcuts = [
    {
      category: t("quickActions.shortcuts.categories.general"),
      items: [
        {
          keys: ["⌘", "K"],
          description: t("quickActions.shortcuts.openPalette"),
        },
      ],
    },
    {
      category: t("quickActions.shortcuts.categories.actions"),
      items: [
        {
          keys: ["⌘", "N"],
          description: t("quickActions.actions.createPassword"),
        },
      ],
    },
    {
      category: t("quickActions.shortcuts.categories.navigation"),
      items: [
        {
          keys: ["⌘", "D"],
          description: t("quickActions.navigate.dashboard"),
        },
        {
          keys: ["⌘", "P"],
          description: t("quickActions.navigate.passwords"),
        },
        {
          keys: ["⌘", "U"],
          description: t("quickActions.navigate.users"),
        },
        {
          keys: ["⌘", "T"],
          description: t("quickActions.navigate.teams"),
        },
        {
          keys: ["⌘", "R"],
          description: t("quickActions.navigate.roles"),
        },
        {
          keys: ["⌘", "A"],
          description: t("quickActions.navigate.auditLogs"),
        },
        {
          keys: ["⌘", "F"],
          description: t("quickActions.navigate.reports"),
        },
        {
          keys: ["⌘", "I"],
          description: t("quickActions.navigate.insights"),
        },
        {
          keys: ["⌘", ","],
          description: t("quickActions.navigate.settings"),
        },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("quickActions.shortcuts.title")}</DialogTitle>
          <DialogDescription>
            {t("quickActions.shortcuts.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {shortcuts.map((category) => (
            <div key={category.category} className="space-y-2">
              <h3 className="text-sm font-semibold">{category.category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      {t("quickActions.shortcuts.keys")}
                    </TableHead>
                    <TableHead>{t("quickActions.shortcuts.description")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <Badge
                                variant="outline"
                                className="font-mono text-xs px-2 py-1"
                              >
                                {key}
                              </Badge>
                              {keyIndex < item.keys.length - 1 && (
                                <span className="text-muted-foreground">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

