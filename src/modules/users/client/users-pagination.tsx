"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter, useSearchParams } from "next/navigation"

interface UsersPaginationProps {
  currentPage: number
  totalPages: number
  total: number
}

export function UsersPagination({ currentPage, totalPages, total }: UsersPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `?${params.toString()}`
  }

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page))
  }

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const showMax = 5

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("ellipsis")
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-muted-foreground">
        Showing {Math.min((currentPage - 1) * 10 + 1, total)} to{" "}
        {Math.min(currentPage * 10, total)} of {total} users
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createPageURL(Math.max(1, currentPage - 1))}
              onClick={(e) => {
                if (currentPage === 1) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                handlePageChange(Math.max(1, currentPage - 1))
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {getPageNumbers().map((page, idx) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href={createPageURL(page)}
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(page)
                  }}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href={createPageURL(Math.min(totalPages, currentPage + 1))}
              onClick={(e) => {
                if (currentPage === totalPages) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }}
              className={
                currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
