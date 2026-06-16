import React, { useEffect, useMemo, useState } from 'react';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';
import { getCsrfToken, requestJson } from '../lib/api.js';

function initialForm() {
  return {
    type_id: '',
    account_number: '',
    description: ''
  };
}

export function PaymentPage({ bootstrap }) {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const manager = useCrudManager({
    listPath: '/payments/methods',
    loadPath: id => `/payments/methods/${id}`,
    createPath: '/payments/methods',
    updatePath: id => `/payments/methods/${id}`,
    deletePath: id => `/payments/methods/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      type_id: String(record.type_id || ''),
      account_number: record.account_number || '',
      description: record.description || ''
    }),
    buildPayload: value => value
  });

  useEffect(() => {
    requestJson('/types/payment')
      .then(response => setPaymentTypes((response.data || []).map(type => ({ value: String(type.id), label: type.name }))))
      .catch(error => manager.setError(error.message || 'Failed to load payment types'));
  }, []);

  const columns = useMemo(() => [
    { key: 'id', label: 'Id', sortable: true, sortType: 'number' },
    { key: 'type', label: 'Type', sortable: true, render: row => row.PaymentType ? row.PaymentType.name : '' },
    { key: 'account_number', label: 'AccountNumber', sortable: true },
    { key: 'description', label: 'Description' }
  ], []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const rows = manager.rows.map(row => Object.assign({}, row, {
      type: row.PaymentType ? row.PaymentType.name : ''
    }));

    if (!term) {
      return rows;
    }

    return rows.filter(row => {
      const values = [row.id, row.type, row.account_number, row.description];
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

  async function handleSubmit() {
    try {
      const method = manager.editingId ? 'PUT' : 'POST';
      const path = manager.editingId ? `/payments/methods/${manager.editingId}` : '/payments/methods';
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
      manager.setError(error.message || 'Failed to save payment method');
    }
  }

  return (
    <ManagerPage
      bootstrap={bootstrap}
      title="Payment Method"
      activeNav="payment"
      fields={[
        { name: 'type_id', label: 'Payment Type', type: 'select', options: paymentTypes, placeholder: 'Select Payment Type' },
        { name: 'account_number', label: 'Account Number' },
        { name: 'description', label: 'Description' }
      ]}
      columns={columns}
      footerLabels={['Id', 'Type', 'AccountNumber', 'Description']}
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
          <label className="form-label mb-1 w-100 text-end" htmlFor="payment-method-search">Search Payment Method</label>
          <input
            id="payment-method-search"
            type="search"
            className="form-control"
            placeholder="Search by type, account number, or description"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>
      }
      formSectionCollapsible={true}
      formSectionTitle="Submit Payment Method"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      formSectionIconPosition="right"
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={handleSortColumn}
    />
  );
}
