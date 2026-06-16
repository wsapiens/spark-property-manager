import React, { useEffect, useMemo, useState } from 'react';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';
import { requestJson } from '../lib/api.js';
import { formatDateInput } from '../lib/date.js';

function initialForm() {
  return {
    property_id: '',
    unit_id: '',
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    lease_start: '',
    lease_end: ''
  };
}

export function TenantPage({ bootstrap }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const manager = useCrudManager({
    listPath: '/tenants',
    loadPath: id => `/tenants/${id}`,
    createPath: '/tenants',
    updatePath: id => `/tenants/${id}`,
    deletePath: id => `/tenants/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      property_id: record.unit_id ? String((units.find(unit => String(unit.id) === String(record.unit_id)) || {}).property_id || '') : '',
      unit_id: String(record.unit_id || ''),
      firstname: record.firstname || '',
      lastname: record.lastname || '',
      phone: record.phone || '',
      email: record.email || '',
      lease_start: record.lease_start ? formatDateInput(new Date(record.lease_start)) : '',
      lease_end: record.lease_end ? formatDateInput(new Date(record.lease_end)) : ''
    }),
    buildPayload: value => value
  });

  useEffect(() => {
    Promise.all([requestJson('/properties'), requestJson('/units')])
      .then(([propertyResult, unitResult]) => {
        setProperties((propertyResult.data || []).map(property => ({
          value: String(property.id),
          label: `${property.address_street}, ${property.address_city}, ${property.address_state} ${property.address_zip}`
        })));
        setUnits((unitResult.data || []).map(unit => ({
          id: unit.id,
          property_id: unit.property_id,
          label: unit.name
        })));
      })
      .catch(error => manager.setError(error.message || 'Failed to load tenant data'));
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

  const columns = useMemo(() => [
    { key: 'id', label: 'Id', sortable: true, sortType: 'number' },
    {
      key: 'unit',
      label: 'PropertyUnit',
      sortable: true,
      render: row => {
        const unit = row.PropertyUnit || {};
        const property = unit.Property || {};
        return `${property.address_street || ''} ${unit.name || ''}`.trim();
      }
    },
    { key: 'firstname', label: 'Firstname', sortable: true },
    { key: 'lastname', label: 'Lastname', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'lease_start', label: 'LeaseStartDate', sortable: true, sortType: 'date', render: row => row.lease_start ? String(row.lease_start).split('T')[0] : '' },
    { key: 'lease_end', label: 'LeaseEndDate', sortable: true, sortType: 'date', render: row => row.lease_end ? String(row.lease_end).split('T')[0] : '' }
  ], []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return manager.rows;
    }

    return manager.rows.filter(row => {
      const unit = row.PropertyUnit || {};
      const property = unit.Property || {};
      const values = [
        row.id,
        property.address_street,
        unit.name,
        row.firstname,
        row.lastname,
        row.phone,
        row.lease_start ? String(row.lease_start).split('T')[0] : '',
        row.lease_end ? String(row.lease_end).split('T')[0] : ''
      ];
      return values.some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [manager.rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const sortConfig = {
      id: { type: 'number', getValue: row => row.id },
      unit: {
        type: 'string',
        getValue: row => {
          const unit = row.PropertyUnit || {};
          const property = unit.Property || {};
          return `${property.address_street || ''} ${unit.name || ''}`.trim();
        }
      },
      firstname: { type: 'string', getValue: row => row.firstname },
      lastname: { type: 'string', getValue: row => row.lastname },
      phone: { type: 'string', getValue: row => row.phone },
      lease_start: { type: 'date', getValue: row => row.lease_start },
      lease_end: { type: 'date', getValue: row => row.lease_end }
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
      if (sortConfig.type === 'date') {
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
    if (!form.lease_start || !form.lease_end) {
      manager.setError('Lease Start Date and Lease End Date are required.');
      return;
    }

    await manager.submit(form, setForm);
    await new Promise(resolve => window.requestAnimationFrame(resolve));
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  }

  return (
    <ManagerPage
      bootstrap={bootstrap}
      title="Tenant"
      activeNav="tenant"
      fields={[
        { name: 'property_id', label: 'Property', type: 'select', options: properties, placeholder: 'Select Property' },
        { name: 'unit_id', label: 'Unit', type: 'select', options: unitOptions, placeholder: 'Select Unit' },
        { name: 'firstname', label: 'First Name' },
        { name: 'lastname', label: 'Last Name' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email' },
        { name: 'lease_start', label: 'Lease Start Date', type: 'date' },
        { name: 'lease_end', label: 'Lease End Date', type: 'date' }
      ]}
      columns={columns}
      footerLabels={['Id', 'PropertyUnit', 'Firstname', 'Lastname', 'Phone', 'Email', 'LeaseStartDate', 'LeaseEndDate']}
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
      formSectionCollapsible={true}
      formSectionTitle="Submit Tenant Info"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      formSectionIconPosition="right"
      tableActionsRight={
        <div style={{ width: '20%', minWidth: '240px' }}>
          <label className="form-label" htmlFor="tenant-search">Search Tenant</label>
          <input
            id="tenant-search"
            type="search"
            className="form-control"
            placeholder="Search by tenant details"
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
