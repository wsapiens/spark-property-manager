import { useEffect, useMemo, useState } from 'react';

export function useTablePagination(rows, { searchTerm = '', sortKey = '', sortDirection = '', defaultPageSize = 10 } = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil((rows || []).length / pageSize));

  const pagedRows = useMemo(() => {
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return (rows || []).slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, rows, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, searchTerm, sortKey, sortDirection]);

  useEffect(() => {
    setCurrentPage(current => Math.min(Math.max(current, 1), totalPages));
  }, [totalPages]);

  function goToPage(nextPage) {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  return {
    currentPage,
    pageSize,
    setPageSize,
    totalPages,
    pagedRows,
    goToPage
  };
}
