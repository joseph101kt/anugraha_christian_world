// components/Pagination.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';

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
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`mx-1 p-2 rounded ${i === currentPage ? 'bg-accent ' : 'bg-secondary'}`}
                >
                    {i}
                </button>
            );
        }
        return buttons;
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
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
    );
}