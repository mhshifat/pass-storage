import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import RenderView from "./render-view";

interface PaginationViewProps {
  page: number;
  total: number;
  perPage: number;
  onPagination: (page: number) => void;
}

export default function PaginationView({ page, perPage, total, onPagination }: PaginationViewProps) {
  const lastPage = Math.ceil((total|| 0) / perPage);

  return (
    <RenderView
        when={(total || 0) > 0}
      >
      <Pagination className="my-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPagination(Math.max(page - 1, 1))}
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              title="Previous page"
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
            const pageNum = page <= 3
              ? i + 1
              : page >= lastPage - 2
                ? lastPage - 4 + i
                : page - 2 + i;

            if (pageNum <= 0 || pageNum > lastPage) return null;

            return (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => onPagination(pageNum)}
                  isActive={pageNum === page}
                  title={`Page ${pageNum}`}
                  className='cursor-pointer'
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {lastPage > 5 && page < lastPage - 2 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => onPagination(lastPage)}
                  title={`Last page (${lastPage})`}
                  className='cursor-pointer'
                >
                  {lastPage}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPagination(Math.min(page + 1, lastPage))}
              className={page === lastPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              title="Next page"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </RenderView>
  )
}
