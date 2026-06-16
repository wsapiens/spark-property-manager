import React, { useEffect, useState } from 'react';

export function TablePaginationPanel({
  currentPage,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPageChange
}) {
  const [pageJump, setPageJump] = useState(String(currentPage));

  useEffect(() => {
    setPageJump(String(currentPage));
  }, [currentPage]);

  function normalizePageJump(value) {
    const numeric = Number(String(value || '').replace(/[^0-9]/g, ''));
    if (!numeric || numeric < 1) {
      return 1;
    }
    if (numeric > totalPages) {
      return totalPages;
    }
    return numeric;
  }

  return (
    <section className="card border-0 shadow-sm mb-3">
      <div className="card-body d-flex flex-wrap gap-2 align-items-center">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <label className="form-label mb-0" htmlFor="table-page-size">Page Size</label>
            <select
              id="table-page-size"
              className="form-select"
              style={{ width: '7rem' }}
              value={pageSize}
              onChange={event => onPageSizeChange(Number(event.target.value))}
            >
              {[5, 10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
          <span className="text-muted">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center ms-auto">
          <label className="form-label mb-0" htmlFor="table-page-jump">Go to page</label>
          <input
            id="table-page-jump"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control"
            style={{ width: '7rem' }}
            value={pageJump}
            onChange={event => {
              const value = String(event.target.value || '').replace(/[^0-9]/g, '');
              setPageJump(value);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const nextPage = normalizePageJump(pageJump);
                setPageJump(String(nextPage));
                onPageChange(nextPage);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              const nextPage = normalizePageJump(pageJump);
              setPageJump(String(nextPage));
              onPageChange(nextPage);
            }}
          >
            Go
          </button>
        </div>
      </div>
    </section>
  );
}
