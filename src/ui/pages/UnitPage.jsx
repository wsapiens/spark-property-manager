import React, { useEffect, useMemo, useState } from 'react';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';
import { getCsrfToken, requestJson } from '../lib/api.js';

function initialForm() {
  return {
    property_id: '',
    name: '',
    is_building: false
  };
}

export function UnitPage({ bootstrap }) {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('address_street');
  const [sortDirection, setSortDirection] = useState('asc');
  const manager = useCrudManager({
    listPath: '/units',
    loadPath: id => `/units/${id}`,
    createPath: '/units',
    updatePath: id => `/units/${id}`,
    deletePath: id => `/units/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      property_id: String(record.property_id || ''),
      name: record.name || '',
      is_building: !!record.is_building
    }),
    buildPayload: value => value
  });

  useEffect(() => {
    requestJson('/properties')
      .then(response => setProperties((response.data || []).map(property => ({
        value: String(property.id),
        label: `${property.address_street}, ${property.address_city}, ${property.address_state} ${property.address_zip}`
      }))))
      .catch(error => manager.setError(error.message || 'Failed to load properties'));
  }, []);

  const columns = useMemo(() => [
    { key: 'id', label: 'Id', sortable: true, sortType: 'number' },
    { key: 'address_street', label: 'Street', sortable: true },
    { key: 'name', label: 'UnitName', sortable: true },
    { key: 'is_building', label: 'IsBuilding', render: row => String(!!row.is_building) }
  ], []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return manager.rows;
    }

    return manager.rows.filter(row => {
      const values = [row.id, row.address_street, row.name, row.is_building];
      return values.some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [manager.rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const direction = sortDirection === 'desc' ? -1 : 1;
    const compare = (left, right) => {
      const a = sortKey === 'id' ? left.id : left[sortKey];
      const b = sortKey === 'id' ? right.id : right[sortKey];
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
      const path = manager.editingId ? `/units/${manager.editingId}` : '/units';
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
      manager.setError(error.message || 'Failed to save unit');
    }
  }

  return (
    <ManagerPage
      bootstrap={bootstrap}
      title="Unit"
      activeNav="unit"
      fields={[
        { name: 'property_id', label: 'Property', type: 'select', options: properties, placeholder: 'Select Property' },
        { name: 'name', label: 'Unit Name' },
        { name: 'is_building', label: 'This Unit Is Building Itself', type: 'checkbox' }
      ]}
      columns={columns}
      footerLabels={['Id', 'Street', 'UnitName', 'IsBuilding']}
      form={form}
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
      rows={sortedRows}
      tableActionsRight={
        <div className="d-flex flex-column align-items-end" style={{ width: '20%', minWidth: '240px' }}>
          <label className="form-label mb-1 w-100 text-end" htmlFor="unit-search">Search Unit</label>
          <input
            id="unit-search"
            type="search"
            className="form-control"
            placeholder="Search by street, unit name, or building"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>
      }
      formSectionCollapsible={true}
      formSectionTitle="Submit Unit Info"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      formSectionIconPosition="right"
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={handleSortColumn}
    />
  );
}
