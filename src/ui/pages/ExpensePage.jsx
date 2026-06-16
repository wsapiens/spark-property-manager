import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { Icon } from '../components/Icon.jsx';
import { TablePaginationPanel } from '../components/TablePaginationPanel.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';
import { useTablePagination } from '../hooks/useTablePagination.js';
import { buildQuery, getCsrfToken, requestJson } from '../lib/api.js';
import { formatDateInput, startOfYearDate, todayDate } from '../lib/date.js';

function initialForm() {
  return {
    property_id: '',
    unit_id: '',
    type_id: '',
    method_id: '',
    pay_amount: '',
    pay_to: '',
    pay_desc: '',
    expense_date: formatDateInput(todayDate()),
    file: ''
  };
}

export function ExpensePage({ bootstrap }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [types, setTypes] = useState([]);
  const [methods, setMethods] = useState([]);
  const [startDate, setStartDate] = useState(formatDateInput(startOfYearDate()));
  const [endDate, setEndDate] = useState(formatDateInput(todayDate()));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('pay_time');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [form, setForm] = useState(initialForm());
  const fileInputRef = useRef(null);

  const listPath = useMemo(() => `/expenses${buildQuery({ start: startDate, end: endDate })}`, [startDate, endDate]);

  const manager = useCrudManager({
    listPath,
    loadPath: id => `/expenses/${id}`,
    createPath: '/expenses',
    updatePath: id => `/expenses/${id}`,
    deletePath: id => `/expenses/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      property_id: record.unit_id ? String((units.find(unit => String(unit.id) === String(record.unit_id)) || {}).property_id || '') : '',
      unit_id: String(record.unit_id || ''),
      type_id: String(record.type_id || ''),
      method_id: record.method_id ? String(record.method_id) : '',
      pay_amount: record.amount || '',
      pay_to: record.pay_to || '',
      pay_desc: record.description || '',
      expense_date: record.pay_time ? formatDateInput(new Date(record.pay_time)) : formatDateInput(todayDate()),
      file: record.file || ''
    }),
    buildPayload: value => ({
      unit_id: value.unit_id,
      type_id: value.type_id,
      method_id: value.method_id || undefined,
      amount: value.pay_amount,
      pay_to: value.pay_to,
      description: value.pay_desc,
      pay_time: new Date(`${value.expense_date}T12:00:00`).toISOString(),
      file: value.file || ''
    })
  });

  useEffect(() => {
    Promise.all([requestJson('/properties'), requestJson('/units'), requestJson('/types/expense'), requestJson('/payments/methods')])
      .then(([propertyResult, unitResult, typeResult, methodResult]) => {
        setProperties((propertyResult.data || []).map(property => ({
          value: String(property.id),
          label: `${property.address_street}, ${property.address_city}, ${property.address_state} ${property.address_zip}`
        })));
        setUnits((unitResult.data || []).map(unit => ({
          id: unit.id,
          property_id: unit.property_id,
          label: unit.name
        })));
        setTypes((typeResult.data || []).map(type => ({ value: String(type.id), label: type.name })));
        setMethods((methodResult.data || []).map(method => ({
          value: String(method.id),
          label: `${method.PaymentType.name}, ${method.account_number}, ${method.description}`
        })));
      })
      .catch(error => manager.setError(error.message || 'Failed to load expense data'));
  }, []);

  useEffect(() => {
    if (!form.property_id) {
      return;
    }
    if (form.unit_id && !units.some(unit => String(unit.id) === String(form.unit_id) && String(unit.property_id) === String(form.property_id))) {
      setForm(current => Object.assign({}, current, { unit_id: '' }));
    }
  }, [form.property_id, form.unit_id, units]);

  useEffect(() => {
    if (!form.unit_id || form.property_id) {
      return;
    }
    const unit = units.find(item => String(item.id) === String(form.unit_id));
    if (unit) {
      setForm(current => Object.assign({}, current, { property_id: String(unit.property_id) }));
    }
  }, [form.property_id, form.unit_id, units]);

  const unitOptions = useMemo(() => units
    .filter(unit => !form.property_id || String(unit.property_id) === String(form.property_id))
    .map(unit => ({ value: String(unit.id), label: unit.label })), [form.property_id, units]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return manager.rows;
    }

    return manager.rows.filter(row => {
      const values = [
        row.id,
        row.address_street,
        row.unit_name,
        row.address_city,
        row.pay_method,
        row.pay_account,
        row.pay_to,
        row.description,
        row.pay_type,
        row.amount,
        row.pay_time ? String(row.pay_time).split('T')[0] : '',
        row.file
      ];
      return values.some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [manager.rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const column = {
      id: { type: 'number' },
      address_street: { type: 'string' },
      unit_name: { type: 'string' },
      address_city: { type: 'string' },
      pay_method: { type: 'string' },
      pay_account: { type: 'string' },
      pay_to: { type: 'string' },
      description: { type: 'string' },
      pay_type: { type: 'string' },
      amount: { type: 'number' },
      pay_time: { type: 'date' }
    }[sortKey];

    if (!column) {
      return filteredRows;
    }

    const direction = sortDirection === 'desc' ? -1 : 1;
    const getSortValue = row => {
      switch (sortKey) {
        case 'id':
          return row.id;
        case 'amount':
          return row.amount;
        case 'pay_time':
          return row.pay_time;
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

      if (column.type === 'number') {
        return Number(a) - Number(b);
      }
      if (column.type === 'date') {
        return new Date(a).getTime() - new Date(b).getTime();
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

  const {
    currentPage,
    pageSize,
    setPageSize,
    totalPages,
    pagedRows,
    goToPage
  } = useTablePagination(sortedRows, { searchTerm, sortKey, sortDirection });

  function handleEditSelected(setter) {
    setIsFormSectionOpen(true);
    manager.editSelected(setter);
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  const columns = useMemo(() => [
    { key: 'id', label: 'Id', sortable: true, sortType: 'number' },
    { key: 'address_street', label: 'PropertyAddress', sortable: true },
    { key: 'unit_name', label: 'PropertyUnit', sortable: true },
    { key: 'address_city', label: 'PropertyCity', sortable: true },
    { key: 'pay_method', label: 'PayMethod', sortable: true },
    { key: 'pay_account', label: 'PayAccount', sortable: true },
    { key: 'pay_to', label: 'PayTo', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'pay_type', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, sortType: 'number' },
    { key: 'pay_time', label: 'Time', render: row => row.pay_time ? String(row.pay_time).split('T')[0] : '', sortable: true, sortType: 'date' },
    {
      key: 'file',
      label: 'Receipt',
      render: row => row.file ? (
        <a href={`/uploads/${row.file}`} target="_blank" rel="noreferrer">
          {row.file}
        </a>
      ) : ''
    }
  ], []);

  function resetReceiptSelection() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function uploadReceipt(file) {
    setIsUploadingReceipt(true);
    try {
      const uploadResult = await requestJson('/file/receipt', {
        method: 'POST',
        headers: {
          'CSRF-Token': getCsrfToken()
        },
        body: (() => {
          const data = new FormData();
          data.append('receipt', file);
          return data;
        })()
      });

      return String(uploadResult || '');
    } finally {
      setIsUploadingReceipt(false);
    }
  }

  async function handleSubmit() {
    try {
      const payloadForm = Object.assign({}, form);
      if (selectedFile && !payloadForm.file) {
        payloadForm.file = await uploadReceipt(selectedFile);
        resetReceiptSelection();
      }

      const payload = {
        unit_id: payloadForm.unit_id,
        type_id: payloadForm.type_id,
        method_id: payloadForm.method_id || undefined,
        amount: payloadForm.pay_amount,
        pay_to: payloadForm.pay_to,
        description: payloadForm.pay_desc,
        pay_time: new Date(`${payloadForm.expense_date}T12:00:00`).toISOString(),
        file: payloadForm.file || ''
      };

      const method = manager.editingId ? 'PUT' : 'POST';
      const path = manager.editingId ? `/expenses/${manager.editingId}` : '/expenses';
      await requestJson(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(payload)
      });

      manager.setMessage('Saved successfully.');
      manager.setError('');
      manager.setEditingId(null);
      resetReceiptSelection();
      setForm(initialForm());
      await manager.refresh();
      await new Promise(resolve => window.requestAnimationFrame(resolve));
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } catch (error) {
      manager.setError(error.message || 'Failed to save expense');
    }
  }

  async function handleUploadReceipt() {
    try {
      if (!selectedFile) {
        manager.setError('Please choose a receipt file to upload.');
        return;
      }

      const uploadedFile = await uploadReceipt(selectedFile);
      setForm(current => Object.assign({}, current, { file: uploadedFile }));
      manager.setMessage('Receipt uploaded.');
      manager.setError('');
    } catch (error) {
      manager.setError(error.message || 'Failed to upload receipt');
    }
  }

  const formWithDateField = Object.assign({}, form, {
    expense_date: form.expense_date || formatDateInput(todayDate())
  });

  return (
    <ManagerPage
      bootstrap={bootstrap}
      title="Expense"
      activeNav="expense"
      fields={[
        { name: 'property_id', label: 'Property', type: 'select', options: properties, placeholder: 'Select Property' },
        { name: 'unit_id', label: 'Unit', type: 'select', options: unitOptions, placeholder: 'Select Unit' },
        { name: 'type_id', label: 'Expense Type', type: 'select', options: types, placeholder: 'Select Expense Type' },
        { name: 'method_id', label: 'Payment Method', type: 'select', options: methods, placeholder: 'Select Payment Method' },
        { name: 'pay_amount', label: 'Pay Amount', type: 'number' },
        { name: 'pay_to', label: 'Pay To' },
        { name: 'pay_desc', label: 'Description', type: 'textarea' },
        { name: 'expense_date', label: 'Expense Date', type: 'date' }
      ]}
      columns={columns}
      footerLabels={['Id', 'PropertyAddress', 'PropertyUnit', 'PropertyCity', 'PayMethod', 'PayAccount', 'PayTo', 'Description', 'Type', 'Amount', 'Time', 'Receipt']}
      form={formWithDateField}
      setForm={setForm}
      selectedIds={manager.selectedIds}
      setSelectedIds={manager.setSelectedIds}
      onSubmit={handleSubmit}
      onEdit={handleEditSelected}
      onDelete={manager.deleteSelected}
      message={manager.message}
      error={manager.error}
      submitLabel={manager.editingId ? 'Update' : 'Submit'}
      loading={manager.loading}
      formSectionCollapsible={true}
      formSectionTitle="Submit Expense"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      sectionAfterForm={
        <>
          <section className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label d-flex align-items-center gap-2" htmlFor="start-date">
                  <Icon name="calendar" className="feather" />
                  <span>Start Date</span>
                </label>
                <input className="form-control" id="start-date" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label d-flex align-items-center gap-2" htmlFor="end-date">
                  <Icon name="calendar" className="feather" />
                  <span>End Date</span>
                </label>
                <input className="form-control" id="end-date" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} />
              </div>
            </div>
          </div>
          </section>
        </>
      }
      leftActions={
        <>
          <div className="w-100">
            <label className="form-label mb-1 d-flex align-items-center gap-2" htmlFor="file-select">
              <Icon name="image" className="feather" />
              <span>Upload Photo Copy Of Receipt</span>
            </label>
            <div className="position-relative d-flex gap-2 align-items-end w-100">
              <input
                ref={fileInputRef}
                id="file-select"
                type="file"
                className="form-control flex-grow-1 pe-5"
                style={{ minWidth: '0' }}
                accept="image/*"
                onChange={event => setSelectedFile(event.target.files && event.target.files[0] ? event.target.files[0] : null)}
                disabled={isUploadingReceipt}
              />
              {isUploadingReceipt ? (
                <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                  <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>
                  <span className="visually-hidden">Uploading receipt</span>
                </span>
              ) : null}
              <button type="button" className="btn btn-outline-secondary flex-shrink-0" onClick={handleUploadReceipt} disabled={isUploadingReceipt}>
                Upload Receipt
              </button>
            </div>
          </div>
        </>
      }
      rightActions={
        null
      }
      tableActionsRight={
        <div className="d-flex flex-column align-items-end gap-2" style={{ width: '20%', minWidth: '240px' }}>
          <div className="w-100">
            <label className="form-label mb-1 w-100 text-end" htmlFor="expense-search">Search Expenses</label>
            <input
              id="expense-search"
              type="search"
              className="form-control"
              placeholder="Search by payee, amount, unit, receipt, or date"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      }
      sectionBeforeTable={
        <TablePaginationPanel
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={goToPage}
        />
      }
      rows={pagedRows}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={handleSortColumn}
    />
  );
}
