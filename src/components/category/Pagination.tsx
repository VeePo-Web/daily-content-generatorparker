import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showPages = 5; // Max pages to show

    if (totalPages <= showPages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <section className="w-full px-4 md:px-6 py-8">
      <div className="flex justify-center items-center gap-3 md:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="p-3 md:p-2 hover:bg-transparent hover:opacity-50 disabled:opacity-30 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-5 w-5 md:h-4 md:w-4" />
        </Button>

        <div className="flex items-center gap-1.5 md:gap-1">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="mx-2 text-sm font-light text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                className={`min-w-10 h-10 md:min-w-8 md:h-8 hover:bg-transparent font-light text-sm ${
                  currentPage === page
                    ? "underline font-normal"
                    : "hover:underline"
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="p-3 md:p-2 hover:bg-transparent hover:opacity-50 disabled:opacity-30 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </div>
    </section>
  );
};

export default Pagination;
