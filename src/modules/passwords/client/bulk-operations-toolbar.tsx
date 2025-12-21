"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Trash2,
  Folder,
  Tag,
  Share2,
  Shield,
  MoreVertical,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"

interface BulkOperationsToolbarProps {
  selectedCount: number
  onBulkDelete: () => void
  onBulkMove: () => void
  onBulkTag: () => void
  onBulkRemoveTags: () => void
  onBulkShare: () => void
  onBulkUnshare: () => void
  onBulkStrength: () => void
  onClearSelection: () => void
  hasDeletePermission: boolean
  hasEditPermission: boolean
  hasSharePermission: boolean
}

export function BulkOperationsToolbar({
  selectedCount,
  onBulkDelete,
  onBulkMove,
  onBulkTag,
  onBulkRemoveTags,
  onBulkShare,
  onBulkUnshare,
  onBulkStrength,
  onClearSelection,
  hasDeletePermission,
  hasEditPermission,
  hasSharePermission,
}: BulkOperationsToolbarProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm border-t shadow-2xl" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <Badge variant="default" className="bg-primary whitespace-nowrap">
              {t("passwords.bulk.selected", { count: selectedCount })}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">{t("passwords.bulk.clearSelection")}</span>
              <span className="sm:hidden">{t("common.clear")}</span>
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            {isMobile ? (
              // Mobile: Use dropdown menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="h-8">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    {t("common.actions")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-56">
                  {hasEditPermission && (
                    <>
                      <DropdownMenuItem onClick={onBulkMove}>
                        <Folder className="h-4 w-4 mr-2" />
                        {t("passwords.bulk.moveToFolder")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onBulkStrength}>
                        <Shield className="h-4 w-4 mr-2" />
                        {t("passwords.bulk.updateStrength")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onBulkTag}>
                        <Tag className="h-4 w-4 mr-2" />
                        {t("passwords.bulk.assignTags")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onBulkRemoveTags}>
                        <Tag className="h-4 w-4 mr-2" />
                        {t("passwords.bulk.removeTags")}
                      </DropdownMenuItem>
                    </>
                  )}

                  {hasSharePermission && (
                    <>
                      {hasEditPermission && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={onBulkShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t("passwords.bulk.share")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onBulkUnshare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        {t("passwords.bulk.unshare")}
                      </DropdownMenuItem>
                    </>
                  )}

                  {hasDeletePermission && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onBulkDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("passwords.bulk.delete")}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Desktop: Show all buttons with scrollable container
              <div className="flex items-center gap-2 overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {hasEditPermission && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkMove}
                      className="h-8 whitespace-nowrap flex-shrink-0"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">{t("passwords.bulk.moveToFolder")}</span>
                      <span className="lg:hidden">{t("common.move")}</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 whitespace-nowrap flex-shrink-0">
                          <Tag className="h-4 w-4 mr-2" />
                          {t("passwords.bulk.tags")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onBulkTag}>
                          <Tag className="h-4 w-4 mr-2" />
                          {t("passwords.bulk.assignTags")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onBulkRemoveTags}>
                          <Tag className="h-4 w-4 mr-2" />
                          {t("passwords.bulk.removeTags")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkStrength}
                      className="h-8 whitespace-nowrap flex-shrink-0"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="hidden lg:inline">{t("passwords.bulk.updateStrength")}</span>
                      <span className="lg:hidden">{t("passwords.strength")}</span>
                    </Button>
                  </>
                )}

                {hasSharePermission && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkShare}
                      className="h-8 whitespace-nowrap flex-shrink-0"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {t("passwords.bulk.share")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkUnshare}
                      className="h-8 whitespace-nowrap flex-shrink-0"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {t("passwords.bulk.unshare")}
                    </Button>
                  </>
                )}

                {hasDeletePermission && (
                  <>
                    <Separator orientation="vertical" className="h-6 flex-shrink-0" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onBulkDelete}
                      className="h-8 whitespace-nowrap flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("passwords.bulk.delete")}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
