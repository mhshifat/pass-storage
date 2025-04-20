import { useTranslation } from "react-i18next";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import RenderView from "./render-view";
import Translate from "./translate";

interface PaginationViewProps {
  page: number;
  total: number;
  perPage: number;
  onPagination: (page: number) => void;
}

export default function PaginationView({ page, perPage, total, onPagination }: PaginationViewProps) {
  const { t } = useTranslation();
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
              title={t("Previous page")}
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
                  title={`${t("Page")} ${t(pageNum + "")}`}
                  className='cursor-pointer'
                >
                  <Translate>{pageNum}</Translate>
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
                  title={`${t("Last page")} (${t(lastPage + "")})`}
                  className='cursor-pointer'
                >
                  {t(lastPage + "")}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPagination(Math.min(page + 1, lastPage))}
              className={page === lastPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              title={t("Next page")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </RenderView>
  )
}
