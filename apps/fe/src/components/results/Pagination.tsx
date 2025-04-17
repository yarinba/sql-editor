import * as React from 'react';

interface PaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageCount,
  onPageChange,
}) => {
  if (pageCount <= 1) return null;

  return (
    <div className="border-t border-slate-200 p-2 flex justify-between items-center">
      <div className="text-sm text-slate-600">
        Page {currentPage} of {pageCount}
      </div>
      <div className="flex gap-1">
        {/* Pagination buttons */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded text-sm ${
            currentPage === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
          aria-label="First page"
        >
          &laquo;
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded text-sm ${
            currentPage === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
          aria-label="Previous page"
        >
          &lsaquo;
        </button>

        {/* Generate page number buttons */}
        {generatePaginationButtons(currentPage, pageCount).map((page) => (
          <button
            key={`page-${page}`}
            onClick={() => page !== '...' && onPageChange(Number(page))}
            className={`px-2 py-1 rounded text-sm ${
              page === '...'
                ? 'bg-slate-100 text-slate-500 cursor-default'
                : page === currentPage.toString()
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage === pageCount}
          className={`px-2 py-1 rounded text-sm ${
            currentPage === pageCount
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
          aria-label="Next page"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => onPageChange(pageCount)}
          disabled={currentPage === pageCount}
          className={`px-2 py-1 rounded text-sm ${
            currentPage === pageCount
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
          aria-label="Last page"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

// Helper function to generate pagination buttons with ellipsis for large page counts
const generatePaginationButtons = (currentPage: number, totalPages: number) => {
  // Show at most 7 page buttons at a time (including ellipsis)
  if (totalPages <= 7) {
    // If there are 7 or fewer pages, show all page numbers
    return Array.from({ length: totalPages }, (_, i) => String(i + 1));
  }

  // Initialize the array of buttons to show
  const pageButtons: string[] = [];

  // Always show first page
  pageButtons.push('1');

  // Logic for adding middle pages
  if (currentPage <= 3) {
    // If current page is near the start
    pageButtons.push('2', '3', '4', '5', '...', String(totalPages));
  } else if (currentPage >= totalPages - 2) {
    // If current page is near the end
    pageButtons.push(
      '...',
      String(totalPages - 4),
      String(totalPages - 3),
      String(totalPages - 2),
      String(totalPages - 1),
      String(totalPages)
    );
  } else {
    // If current page is in the middle
    pageButtons.push(
      '...',
      String(currentPage - 1),
      String(currentPage),
      String(currentPage + 1),
      '...',
      String(totalPages)
    );
  }

  return pageButtons;
};

export default Pagination;
