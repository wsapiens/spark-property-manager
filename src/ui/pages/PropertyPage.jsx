import React, { useEffect, useMemo, useState } from 'react';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';
import { getCsrfToken, requestJson } from '../lib/api.js';

function initialForm() {
  return {
    type_id: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    index_number: '',
    loan_info: '',
    memo: ''
  };
}

export function PropertyPage({ bootstrap }) {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const manager = useCrudManager({
    listPath: '/properties',
    loadPath: id => `/properties/${id}`,
    createPath: '/properties',
    updatePath: id => `/properties/${id}`,
    deletePath: id => `/properties/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      type_id: String(record.type_id || ''),
      address_street: record.address_street || '',
      address_city: record.address_city || '',
      address_state: record.address_state || '',
      address_zip: record.address_zip || '',
      index_number: record.index_number || '',
      loan_info: record.loan_info || '',
      memo: record.memo || ''
    }),
    buildPayload: value => value
  });

  useEffect(() => {
    requestJson('/types/property')
      .then(response => setPropertyTypes((response.data || []).map(type => ({ value: String(type.id), label: type.name }))))
      .catch(error => manager.setError(error.message || 'Failed to load property types'));
  }, []);

  async function handleSubmit() {
    try {
      const method = manager.editingId ? 'PUT' : 'POST';
      const path = manager.editingId ? `/properties/${manager.editingId}` : '/properties';
      await requestJson(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(form)
      });

      manager.setMessage('Saved successfully.');
      manager.setError('');
      manager.setEditingId(null);
      setForm(initialForm());
      await manager.refresh();
      await new Promise(resolve => window.requestAnimationFrame(resolve));
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } catch (error) {
      manager.setError(error.message || 'Failed to save property');
    }
  }

  const columns = useMemo(() => [
    { key: 'id', label: 'Id', sortable: true, sortType: 'number' },
    { key: 'address_street', label: 'Street', sortable: true },
    { key: 'address_city', label: 'City', sortable: true },
    { key: 'address_state', label: 'State', sortable: true },
    { key: 'address_zip', label: 'Zip', sortable: true },
    { key: 'type', label: 'Type', sortable: true, render: row => row.PropertyType ? row.PropertyType.name : '' },
    { key: 'index_number', label: 'Index', sortable: true },
    { key: 'loan_info', label: 'Loan', sortable: true },
    { key: 'memo', label: 'Memo' }
  ], []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const rows = manager.rows.map(row => Object.assign({}, row, {
      type: row.PropertyType ? row.PropertyType.name : ''
    }));

    if (!term) {
      return rows;
    }

    return rows.filter(row => {
      const values = [
        row.id,
        row.address_street,
        row.address_city,
        row.address_state,
        row.address_zip,
        row.type,
        row.index_number,
        row.loan_info
      ];
      return values.some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [manager.rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const direction = sortDirection === 'desc' ? -1 : 1;

    const getSortValue = row => {
      switch (sortKey) {
        case 'id':
          return row.id;
        case 'type':
          return row.type;
        default:
          return row[sortKey];
      }
    };

    const compare = (left, right) => {
      const a = getSortValue(left);
      const b = getSortValue(right);
      if (a === b) {
        return 0;
      }
      if (a === null || a === undefined || a === '') {
        return 1;
      }
      if (b === null || b === undefined || b === '') {
        return -1;
      }

      if (sortKey === 'id') {
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

  function handleEditSelected(setter) {
    const shouldScroll = isFormSectionOpen;
    setIsFormSectionOpen(true);
    manager.editSelected(setter);
    if (shouldScroll) {
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  return (
    <ManagerPage
      bootstrap={bootstrap}
      title="Property"
      activeNav="property"
      fields={[
        { name: 'type_id', label: 'Property Type', type: 'select', options: propertyTypes, placeholder: 'Select Property Type' },
        { name: 'address_street', label: 'Street' },
        { name: 'address_city', label: 'City' },
        { name: 'address_state', label: 'State' },
        { name: 'address_zip', label: 'ZIP' },
        { name: 'index_number', label: 'Index Number' },
        { name: 'loan_info', label: 'Loan Info' },
        { name: 'memo', label: 'Memo' }
      ]}
      columns={columns}
      footerLabels={['Id', 'Street', 'City', 'State', 'Zip', 'Type', 'Index', 'Loan', 'Memo']}
      form={form}
      setForm={setForm}
      rows={sortedRows}
      selectedIds={manager.selectedIds}
      setSelectedIds={manager.setSelectedIds}
      onSubmit={handleSubmit}
      onEdit={handleEditSelected}
      onDelete={manager.deleteSelected}
      message={manager.message}
      error={manager.error}
      submitLabel={manager.editingId ? 'Update' : 'Submit'}
      loading={manager.loading}
      tableActionsRight={
        <div className="d-flex flex-column align-items-end" style={{ width: '20%', minWidth: '240px' }}>
          <label className="form-label mb-1 w-100 text-end" htmlFor="property-search">Search Property</label>
          <input
            id="property-search"
            type="search"
            className="form-control"
            placeholder="Search by street, city, state, zip, type, index, or loan"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>
      }
      formSectionCollapsible={true}
      formSectionTitle="Submit Property Info"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      formSectionIconPosition="right"
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={handleSortColumn}
    />
  );
}
