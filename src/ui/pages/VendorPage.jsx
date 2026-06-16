import React, { useMemo, useState } from 'react';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';

function initialForm() {
  return {
    name: '',
    phone: '',
    email: '',
    category: '',
    note: ''
  };
}

export function VendorPage({ bootstrap }) {
  const [form, setForm] = useState(initialForm());
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const manager = useCrudManager({
    listPath: '/vendors',
    loadPath: id => `/vendors/${id}`,
    createPath: '/vendors',
    updatePath: id => `/vendors/${id}`,
    deletePath: id => `/vendors/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      name: record.name || '',
      phone: record.phone || '',
      email: record.email || '',
      category: record.category || '',
      note: record.note || ''
    }),
    buildPayload: value => value
  });

  const columns = useMemo(() => [
    { key: 'id', label: 'Id', sortable: true, sortType: 'number' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true, render: row => row.phone ? <a href={`tel:${row.phone}`}>{row.phone}</a> : '' },
    { key: 'email', label: 'Email', render: row => row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : '' },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'note', label: 'Note' }
  ], []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return manager.rows;
    }

    return manager.rows.filter(row => {
      const values = [
        row.id,
        row.name,
        row.phone,
        row.email,
        row.category,
        row.note
      ];
      return values.some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [manager.rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const sortConfig = {
      id: { type: 'number', getValue: row => row.id },
      name: { type: 'string', getValue: row => row.name },
      phone: { type: 'string', getValue: row => row.phone },
      category: { type: 'string', getValue: row => row.category }
    }[sortKey];

    if (!sortConfig) {
      return filteredRows;
    }

    const direction = sortDirection === 'desc' ? -1 : 1;
    const compare = (left, right) => {
      const a = sortConfig.getValue(left);
      const b = sortConfig.getValue(right);

      if (a === b) {
        return 0;
      }
      if (a === null || a === undefined || a === '') {
        return 1;
      }
      if (b === null || b === undefined || b === '') {
        return -1;
      }

      if (sortConfig.type === 'number') {
        return Number(a) - Number(b);
      }

      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    };

    return [...filteredRows].sort((left, right) => compare(left, right) * direction);
  }, [filteredRows, sortDirection, sortKey]);

  function handleSortColumn(columnKey) {
    setSortKey(currentKey => {
      if (currentKey === columnKey) {
        setSortDirection(currentDirection => currentDirection === 'asc' ? 'desc' : 'asc');
        return currentKey;
      }
      setSortDirection('asc');
      return columnKey;
    });
  }

  return (
    <ManagerPage
      bootstrap={bootstrap}
      title="Vendor"
      activeNav="vendor"
      fields={[
        { name: 'name', label: 'Name' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email' },
        { name: 'category', label: 'Category' },
        { name: 'note', label: 'Note' }
      ]}
      columns={columns}
      footerLabels={['Id', 'Name', 'Phone', 'Email', 'Category', 'Note']}
      form={form}
      setForm={setForm}
      rows={sortedRows}
      selectedIds={manager.selectedIds}
      setSelectedIds={manager.setSelectedIds}
      onSubmit={() => manager.submit(form, setForm)}
      onEdit={setter => manager.editSelected(setter)}
      onDelete={manager.deleteSelected}
      message={manager.message}
      error={manager.error}
      submitLabel={manager.editingId ? 'Update' : 'Submit'}
      loading={manager.loading}
      formSectionCollapsible={true}
      formSectionTitle="Submit Vendor Info"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      formSectionIconPosition="right"
      tableActionsRight={
        <div style={{ width: '20%', minWidth: '240px' }}>
          <label className="form-label" htmlFor="vendor-search">Search Vendor</label>
          <input
            id="vendor-search"
            type="search"
            className="form-control"
            placeholder="Search by vendor details"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>
      }
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={handleSortColumn}
    />
  );
}
