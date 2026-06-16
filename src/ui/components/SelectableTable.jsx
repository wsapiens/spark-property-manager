import React, { useEffect, useRef } from 'react';

export function SelectableTable({
  rows,
  columns,
  rowKey = row => row.id,
  selectedKeys = [],
  onToggleRow,
  onToggleAll,
  footerLabels,
  sortKey,
  sortDirection,
  onSortColumn
}) {
  const headerCheckboxRef = useRef(null);
  const allKeys = rows.map(rowKey);
  const allSelected = rows.length > 0 && allKeys.every(key => selectedKeys.includes(key));
  const someSelected = selectedKeys.length > 0 && !allSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
      headerCheckboxRef.current.checked = allSelected;
    }
  }, [allSelected, someSelected]);

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle w-100">
        <thead>
          <tr>
            <th scope="col" style={{ width: '3rem' }}>
              <input
                ref={headerCheckboxRef}
                type="checkbox"
                checked={allSelected}
                onChange={event => onToggleAll(event.target.checked)}
                aria-label="Select all rows"
              />
            </th>
            {columns.map(column => (
                <th scope="col" key={column.key}>
                {column.sortable && onSortColumn ? (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none text-reset fw-semibold"
                    onClick={() => onSortColumn(column.key)}
                    aria-label={`Sort by ${column.label}`}
                  >
                    <span className="d-inline-flex align-items-center gap-1">
                      <span>{column.label}</span>
                      <span aria-hidden="true" className="text-muted">
                        {sortKey === column.key ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                      </span>
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const key = rowKey(row);
            const selected = selectedKeys.includes(key);
            return (
              <tr key={key} className={selected ? 'table-active' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={event => onToggleRow(row, event.target.checked)}
                    aria-label={`Select row ${key}`}
                  />
                </td>
                {columns.map(column => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        {footerLabels ? (
          <tfoot>
            <tr>
              <th></th>
              {footerLabels.map(label => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
