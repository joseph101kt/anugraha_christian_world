// components/Pagination.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface PaginationProps {
    totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const handlePageChange = (page: number) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('page', page.toString());
        router.push(`?${newSearchParams.toString()}`);
    };

    const renderPageButtons = () => {
        const buttons = [];
        const maxButtons = 5; // Maximum number of buttons to show
        const halfMaxButtons = Math.floor(maxButtons / 2);

        // Determine the start and end pages for the visible buttons
        let startPage = Math.max(1, currentPage - halfMaxButtons);
        let endPage = Math.min(totalPages, currentPage + halfMaxButtons);

        // Adjust start and end pages to always show maxButtons if possible
        if (totalPages > maxButtons) {
            if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - maxButtons + 1);
            } else if (startPage === 1) {
                endPage = Math.min(totalPages, maxButtons);
            }
        }

        // Add "..." at the beginning if there are pages before the start page
        if (startPage > 1) {
            buttons.push(
                <button
                    key="ellipsis-start"
                    onClick={() => handlePageChange(1)}
                    className="mx-1 p-2 rounded bg-secondary"
                >
                    ...
                </button>
            );
        }

        // Add the page number buttons
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`mx-1 p-2 rounded ${i === currentPage ? 'bg-accent' : 'bg-secondary'}`}
                >
                    {i}
                </button>
            );
        }

        // Add "..." at the end if there are pages after the end page
        if (endPage < totalPages) {
            buttons.push(
                <button
                    key="ellipsis-end"
                    onClick={() => handlePageChange(totalPages)}
                    className="mx-1 p-2 rounded bg-secondary"
                >
                    ...
                </button>
            );
        }

        return buttons;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <Suspense>
            <div className="flex justify-center my-8">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 mx-1 rounded bg-secondary disabled:opacity-50"
                >
                    Previous
                </button>
                {renderPageButtons()}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 mx-1 rounded bg-secondary disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </Suspense>
    );
}