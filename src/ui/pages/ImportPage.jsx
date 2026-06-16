import React, { useEffect, useMemo, useState } from 'react';
import { Shell } from '../components/Shell.jsx';
import { CollapsibleSection } from '../components/CollapsibleSection.jsx';
import { Dialog } from '../components/Dialog.jsx';
import { SelectableTable } from '../components/SelectableTable.jsx';
import { buildQuery, getCsrfToken, requestJson } from '../lib/api.js';

const emptyForm = {
  filter_column_number: '',
  filter_keyword: '',
  date_column_number: '',
  date_format: '',
  pay_to_column_number: '',
  amount_column_number: '',
  category_column_number: '',
  description_column_number: ''
};

export function ImportPage({ bootstrap }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [methods, setMethods] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [methodId, setMethodId] = useState('');
  const [statementFile, setStatementFile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(bootstrap.message || '');
  const [errorMessage, setErrorMessage] = useState(bootstrap.error_message || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedRows = useMemo(
    () => configs.filter(config => selectedIds.includes(config.id)),
    [configs, selectedIds]
  );

  async function loadInitialData() {
    const [propertyResult, methodResult, configResult] = await Promise.all([
      requestJson('/properties'),
      requestJson('/payments/methods'),
      requestJson('/import/configs')
    ]);

    setProperties(propertyResult.data || []);
    setMethods(methodResult.data || []);
    setConfigs(configResult.data || []);
  }

  useEffect(() => {
    loadInitialData().catch(error => setErrorMessage(error.message || 'Failed to load import page data'));
  }, []);

  useEffect(() => {
    if (!propertyId) {
      setUnits([]);
      return;
    }

    requestJson(`/properties/${propertyId}/units`)
      .then(response => setUnits((response.data && response.data[0] && response.data[0].PropertyUnits) || []))
      .catch(error => setErrorMessage(error.message || 'Failed to load units'));
  }, [propertyId]);

  function updateField(name, value) {
    setForm(current => Object.assign({}, current, { [name]: value }));
  }

  async function refreshConfigs() {
    const response = await requestJson('/import/configs');
    setConfigs(response.data || []);
    setSelectedIds([]);
  }

  async function handleSubmitConfig() {
    try {
      const payload = {
        filter_column_number: form.filter_column_number,
        filter_keyword: form.filter_keyword,
        date_column_number: form.date_column_number,
        date_format: form.date_format,
        pay_to_column_number: form.pay_to_column_number,
        amount_column_number: form.amount_column_number,
        category_column_number: form.category_column_number,
        description_column_number: form.description_column_number
      };

      if (!payload.filter_column_number || !payload.filter_keyword || !payload.amount_column_number || !payload.pay_to_column_number) {
        setErrorMessage('Filter Column Number, Filter Keyword, Amount Column Number and PayTo Column Number are required.');
        return;
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/import/configs/${editingId}` : '/import/configs';
      await requestJson(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(payload)
      });

      setMessage('Import statement configuration saved.');
      setErrorMessage('');
      setForm(emptyForm);
      setEditingId(null);
      await refreshConfigs();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to save configuration');
    }
  }

  async function handleUploadStatement() {
    try {
      if (!methodId || methodId.toLowerCase().includes('select')) {
        setErrorMessage('Please select a payment method.');
        return;
      }

      if (!statementFile) {
        setErrorMessage('Please choose a statement file.');
        return;
      }

      const formData = new FormData();
      formData.append('statement', statementFile);
      await requestJson(`/file/statement/${methodId}${buildQuery({
        tzId: Intl.DateTimeFormat().resolvedOptions().timeZone,
        unitId
      })}`, {
        method: 'POST',
        headers: {
          'CSRF-Token': getCsrfToken()
        },
        body: formData
      });

      window.location.href = '/manager/expense';
    } catch (error) {
      setErrorMessage(error.message || 'Failed to upload statement');
    }
  }

  function handleEditSelected() {
    if (selectedIds.length !== 1) {
      setErrorMessage('Select exactly one configuration to edit.');
      return;
    }

    requestJson(`/import/configs/${selectedIds[0]}`)
      .then(config => {
        setForm({
          filter_column_number: config.filter_column_number || '',
          filter_keyword: config.filter_keyword || '',
          date_column_number: config.date_column_number || '',
          date_format: config.date_format || '',
          pay_to_column_number: config.pay_to_column_number || '',
          amount_column_number: config.amount_column_number || '',
          category_column_number: config.category_column_number || '',
          description_column_number: config.description_column_number || ''
        });
        setEditingId(config.id);
      })
      .catch(error => setErrorMessage(error.message || 'Failed to load configuration'));
  }

  async function handleDeleteSelected() {
    try {
      const csrf = getCsrfToken();
      await Promise.all(selectedIds.map(id => requestJson(`/import/configs/${id}`, {
        method: 'DELETE',
        headers: {
          'CSRF-Token': csrf
        }
      })));
      setConfirmDelete(false);
      await refreshConfigs();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete configuration');
    }
  }

  return (
    <Shell
      version={bootstrap.version}
      title={bootstrap.title || 'Import Transactions'}
      activeNav="import"
      manager={bootstrap.manager}
    >
      {message ? <div className="alert alert-info">{message}</div> : null}
      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      <CollapsibleSection title="Upload Statement" defaultOpen={true}>
        <div className="mb-3">
          <label className="form-label">Property</label>
          <select className="form-select" value={propertyId} onChange={event => setPropertyId(event.target.value)}>
            <option value="">Select Property</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.address_street}, {property.address_city}, {property.address_state} {property.address_zip}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Unit</label>
          <select className="form-select" value={unitId} onChange={event => setUnitId(event.target.value)}>
            <option value="">Select Unit</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Payment Method</label>
          <select className="form-select" value={methodId} onChange={event => setMethodId(event.target.value)}>
            <option value="">Select Payment Method</option>
            {methods.map(method => (
              <option key={method.id} value={method.id}>
                {method.PaymentType.name}, {method.account_number}, {method.description}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Statement</label>
          <input
            type="file"
            className="form-control"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={event => setStatementFile(event.target.files ? event.target.files[0] : null)}
          />
        </div>

        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-outline-secondary" onClick={handleUploadStatement}>
            Upload Statement
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Import Statement Config" defaultOpen={false}>
        <div className="row g-3">
          {[
            ['filter_column_number', 'Filter Column Number', 'number'],
            ['filter_keyword', 'Filter Keyword', 'text'],
            ['date_column_number', 'Date Column Number', 'number'],
            ['date_format', 'Date Format', 'text'],
            ['pay_to_column_number', 'PayTo Column', 'number'],
            ['amount_column_number', 'Amount Column', 'number'],
            ['category_column_number', 'Category Column', 'number'],
            ['description_column_number', 'Description Column', 'number']
          ].map(([field, label, type]) => (
            <div className="col-12" key={field}>
              <label className="form-label" htmlFor={field}>{label}</label>
              <input
                id={field}
                type={type}
                className="form-control"
                value={form[field]}
                onChange={event => updateField(field, event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="btn btn-primary" onClick={handleSubmitConfig}>
            {editingId ? 'Update Config' : 'Submit'}
          </button>
        </div>
      </CollapsibleSection>

      <section className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={handleEditSelected}>
            Edit Selected
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => setConfirmDelete(true)}>
            Delete Selected
          </button>
        </div>
      </section>

      <SelectableTable
        rows={configs}
        selectedKeys={selectedIds}
        onToggleRow={(row, checked) => {
          setSelectedIds(current => checked ? [...current, row.id] : current.filter(id => id !== row.id));
        }}
        onToggleAll={checked => {
          setSelectedIds(checked ? configs.map(config => config.id) : []);
        }}
        columns={[
          { key: 'id', label: 'Id' },
          { key: 'filter_column_number', label: 'FilterColumn' },
          { key: 'filter_keyword', label: 'FilterKeyword' },
          { key: 'date_column_number', label: 'DateColumn' },
          { key: 'date_format', label: 'DateFormat' },
          { key: 'pay_to_column_number', label: 'PayToColumn' },
          { key: 'amount_column_number', label: 'AmountColumn' },
          { key: 'category_column_number', label: 'CategoryColumn' },
          { key: 'description_column_number', label: 'DescriptionColumn' }
        ]}
        footerLabels={[
          'Id',
          'FilterColumn',
          'FilterKeyword',
          'DateColumn',
          'DateFormat',
          'PayToColumn',
          'AmountColumn',
          'CategoryColumn',
          'DescriptionColumn'
        ]}
      />

      <Dialog
        title="Delete Selected Configurations"
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        actions={
          <button type="button" className="btn btn-danger" onClick={handleDeleteSelected}>
            Delete
          </button>
        }
      >
        {selectedRows.length > 0 ? (
          <p>Delete {selectedRows.length} selected configuration{selectedRows.length === 1 ? '' : 's'}?</p>
        ) : (
          <p>Select at least one configuration before deleting.</p>
        )}
      </Dialog>
    </Shell>
  );
}
