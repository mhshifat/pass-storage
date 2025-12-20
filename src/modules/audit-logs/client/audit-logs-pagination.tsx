"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AuditLogsPaginationProps {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function AuditLogsPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: AuditLogsPaginationProps) {
  const { t } = useTranslation()
  const start = Math.min((currentPage - 1) * pageSize + 1, total)
  const end = Math.min(currentPage * pageSize, total)

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t("audit.paginationInfo", { start, end, total })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("common.previous")}
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page: number
            if (totalPages <= 5) {
              page = i + 1
            } else if (currentPage <= 3) {
              page = i + 1
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i
            } else {
              page = currentPage - 2 + i
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          {t("common.next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
