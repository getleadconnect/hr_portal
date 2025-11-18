import { Button } from './ui/button';

export default function Pagination({ currentPage, lastPage, total, from, to, onPageChange }) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (lastPage <= maxPagesToShow) {
            // Show all pages if total pages are less than max
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            // Show pages with ellipsis
            if (currentPage <= 3) {
                // Show first 5 pages
                for (let i = 1; i <= Math.min(5, lastPage); i++) {
                    pages.push(i);
                }
                if (lastPage > 5) {
                    pages.push('...');
                    pages.push(lastPage);
                }
            } else if (currentPage >= lastPage - 2) {
                // Show last 5 pages
                pages.push(1);
                pages.push('...');
                for (let i = Math.max(lastPage - 4, 1); i <= lastPage; i++) {
                    pages.push(i);
                }
            } else {
                // Show pages around current page
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(lastPage);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Showing {from || 0} to {to || 0} of {total || 0} results
            </div>
            <div className="flex gap-1 items-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>

                {pageNumbers.map((pageNum, index) => {
                    if (pageNum === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onPageChange(pageNum)}
                            className="min-w-[40px]"
                        >
                            {pageNum}
                        </Button>
                    );
                })}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
