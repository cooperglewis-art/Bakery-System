import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  /** Total number of items (shown as "X items" text) */
  totalItems?: number;
  /** Label for items, e.g. "customers", "ingredients". Defaults to "items". */
  itemLabel?: string;
  /** Base path, e.g. "/dashboard/customers" */
  basePath: string;
  /** Other search params to preserve when paginating */
  searchParams?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    }
  }
  if (page > 1) {
    params.set("page", page.toString());
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationNav({
  currentPage,
  totalPages,
  totalItems,
  itemLabel = "items",
  basePath,
  searchParams,
}: PaginationNavProps) {
  if (totalPages <= 1 && !totalItems) return null;

  // Build page numbers to show (window of 5 around current)
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {totalItems != null && (
        <p className="text-sm text-gray-500">
          {totalItems} {totalItems === 1 ? itemLabel.replace(/s$/, "") : itemLabel} total
          {totalPages > 1 && (
            <span>
              {" "}&middot; Page {currentPage} of {totalPages}
            </span>
          )}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {currentPage <= 1 ? (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildHref(basePath, currentPage - 1, searchParams)}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Link>
            </Button>
          )}

          {start > 1 && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(basePath, 1, searchParams)}>1</Link>
              </Button>
              {start > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {pages.map((page) =>
            page === currentPage ? (
              <Button
                key={page}
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
              >
                {page}
              </Button>
            ) : (
              <Button key={page} variant="outline" size="sm" asChild>
                <Link href={buildHref(basePath, page, searchParams)}>
                  {page}
                </Link>
              </Button>
            )
          )}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(basePath, totalPages, searchParams)}>
                  {totalPages}
                </Link>
              </Button>
            </>
          )}

          {currentPage >= totalPages ? (
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildHref(basePath, currentPage + 1, searchParams)}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
