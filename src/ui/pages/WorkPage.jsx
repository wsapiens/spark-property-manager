import React, { useEffect, useMemo, useState } from 'react';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { TablePaginationPanel } from '../components/TablePaginationPanel.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';
import { requestJson } from '../lib/api.js';
import { formatDateInput } from '../lib/date.js';
import { useTablePagination } from '../hooks/useTablePagination.js';

function initialForm() {
  return {
    property_id: '',
    unit_id: '',
    description: '',
    status: 'not started',
    estimation: '',
    vendor_id: '',
    vendor_name: '',
    vendor_phone: '',
    vendor_email: '',
    start_date: '',
    end_date: ''
  };
}

export function WorkPage({ bootstrap }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [form, setForm] = useState(initialForm());
  const manager = useCrudManager({
    listPath: '/works',
    loadPath: id => `/works/${id}`,
    createPath: '/works',
    updatePath: id => `/works/${id}`,
    deletePath: id => `/works/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      property_id: record.unit_id ? String((units.find(unit => String(unit.id) === String(record.unit_id)) || {}).property_id || '') : '',
      unit_id: String(record.unit_id || ''),
      description: record.description || '',
      status: record.status || 'not started',
      estimation: record.estimation || '',
      vendor_id: record.vendor_id ? String(record.vendor_id) : '',
      vendor_name: '',
      vendor_phone: '',
      vendor_email: '',
      start_date: record.start_date ? formatDateInput(new Date(record.start_date)) : '',
      end_date: record.end_date ? formatDateInput(new Date(record.end_date)) : ''
    }),
    buildPayload: value => ({
      unit_id: value.unit_id,
      description: value.description,
      status: value.status,
      estimation: value.estimation,
      vendor_id: value.vendor_id || undefined,
      vendor_name: value.vendor_name || undefined,
      vendor_phone: value.vendor_phone || undefined,
      vendor_email: value.vendor_email || undefined,
      start_date: value.start_date || undefined,
      end_date: value.end_date || undefined
    })
  });

  useEffect(() => {
    Promise.all([requestJson('/properties'), requestJson('/units'), requestJson('/vendors')])
      .then(([propertyResult, unitResult, vendorResult]) => {
        setProperties((propertyResult.data || []).map(property => ({
          value: String(property.id),
          label: `${property.address_street}, ${property.address_city}, ${property.address_state} ${property.address_zip}`
        })));
        setUnits((unitResult.data || []).map(unit => ({
          id: unit.id,
          property_id: unit.property_id,
          label: unit.name
        })));
        setVendors((vendorResult.data || []).map(vendor => ({
          value: String(vendor.id),
          label: vendor.name
        })));
      })
      .catch(error => manager.setError(error.message || 'Failed to load work data'));
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

  useEffect(() => {
    let cancelled = false;

    if (!form.vendor_id) {
      setForm(current => {
        if (!current.vendor_name && !current.vendor_phone && !current.vendor_email) {
          return current;
        }
        return Object.assign({}, current, {
          vendor_name: '',
          vendor_phone: '',
          vendor_email: ''
        });
      });
      return () => {
        cancelled = true;
      };
    }

    requestJson(`/vendors/${form.vendor_id}`)
      .then(vendor => {
        if (cancelled || !vendor) {
          return;
        }
        setForm(current => {
          const next = {
            vendor_name: vendor.name || '',
            vendor_phone: vendor.phone || '',
            vendor_email: vendor.email || ''
          };
          if (
            current.vendor_name === next.vendor_name &&
            current.vendor_phone === next.vendor_phone &&
            current.vendor_email === next.vendor_email
          ) {
            return current;
          }
          return Object.assign({}, current, next);
        });
      })
      .catch(error => {
        if (!cancelled) {
          manager.setError(error.message || 'Failed to load vendor data');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form.vendor_id]);

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
    { key: 'description', label: 'Description', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'estimation', label: 'Estimation', sortable: true, sortType: 'number' },
    { key: 'scheduled_date', label: 'ScheduleDate', sortable: true, sortType: 'date', render: row => row.scheduled_date ? String(row.scheduled_date).split('T')[0] : '' },
    { key: 'start_date', label: 'StartDate', sortable: true, sortType: 'date', render: row => row.start_date ? String(row.start_date).split('T')[0] : '' },
    { key: 'end_date', label: 'EndDate', sortable: true, sortType: 'date', render: row => row.end_date ? String(row.end_date).split('T')[0] : '' },
    { key: 'vendor_name', label: 'VendorName', sortable: true, render: row => row.Vendor ? row.Vendor.name : '' },
    { key: 'vendor_phone', label: 'VendorPhone', render: row => row.Vendor ? row.Vendor.phone : '' },
    { key: 'vendor_email', label: 'VendorEmail', render: row => row.Vendor ? row.Vendor.email : '' }
  ], []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return manager.rows;
    }

    return manager.rows.filter(row => {
      const unit = row.PropertyUnit || {};
      const property = unit.Property || {};
      const vendor = row.Vendor || {};
      const values = [
        row.id,
        property.address_street,
        unit.name,
        row.description,
        row.status,
        row.estimation,
        row.scheduled_date ? String(row.scheduled_date).split('T')[0] : '',
        row.start_date ? String(row.start_date).split('T')[0] : '',
        row.end_date ? String(row.end_date).split('T')[0] : '',
        vendor.name,
        vendor.phone,
        vendor.email
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
      description: { type: 'string', getValue: row => row.description },
      status: { type: 'string', getValue: row => row.status },
      estimation: { type: 'number', getValue: row => row.estimation },
      scheduled_date: { type: 'date', getValue: row => row.scheduled_date },
      start_date: { type: 'date', getValue: row => row.start_date },
      end_date: { type: 'date', getValue: row => row.end_date },
      vendor_name: { type: 'string', getValue: row => (row.Vendor ? row.Vendor.name : '') }
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

  const {
    currentPage,
    pageSize,
    setPageSize,
    totalPages,
    pagedRows,
    goToPage
  } = useTablePagination(sortedRows, { searchTerm, sortKey, sortDirection });

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
    setIsFormSectionOpen(true);
    manager.editSelected(setter);
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  return (
    <ManagerPage
      bootstrap={bootstrap}
      title="Work Record"
      activeNav="work"
      fields={[
        { name: 'property_id', label: 'Property', type: 'select', options: properties, placeholder: 'Select Property' },
        { name: 'unit_id', label: 'Unit', type: 'select', options: unitOptions, placeholder: 'Select Unit' },
        { name: 'description', label: 'Description' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'not started', label: 'Not Started' },
          { value: 'started', label: 'Started' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ] },
        { name: 'estimation', label: 'Estimation', type: 'number' },
        { name: 'vendor_id', label: 'Vendor', type: 'select', options: vendors, placeholder: 'Select Vendor' },
        { name: 'vendor_phone', label: 'Vendor Phone' },
        { name: 'vendor_email', label: 'Vendor Email' },
        { name: 'start_date', label: 'Work Start Date', type: 'date' },
        { name: 'end_date', label: 'Work End Date', type: 'date' }
      ]}
      columns={columns}
      footerLabels={['Id', 'PropertyUnit', 'Description', 'Status', 'Estimation', 'ScheduleDate', 'StartDate', 'EndDate', 'VendorName', 'VendorPhone', 'VendorEmail']}
      form={form}
      setForm={setForm}
      rows={pagedRows}
      selectedIds={manager.selectedIds}
      setSelectedIds={manager.setSelectedIds}
      onSubmit={async () => {
        await manager.submit(form, setForm);
        await new Promise(resolve => window.requestAnimationFrame(resolve));
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }}
      onEdit={handleEditSelected}
      onDelete={manager.deleteSelected}
      message={manager.message}
      error={manager.error}
      submitLabel={manager.editingId ? 'Update' : 'Submit'}
      loading={manager.loading}
      formSectionCollapsible={true}
      formSectionTitle="Submit Work Record"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      formSectionIconPosition="right"
      sectionBeforeTable={
        <TablePaginationPanel
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          onPageChange={goToPage}
        />
      }
      tableActionsRight={
        <div style={{ width: '20%', minWidth: '240px' }}>
          <label className="form-label" htmlFor="work-search">Search Work Record</label>
          <input
            id="work-search"
            type="search"
            className="form-control"
            placeholder="Search by work record details"
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
