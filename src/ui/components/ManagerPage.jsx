import React from 'react';
import { Shell } from './Shell.jsx';
import { SelectableTable } from './SelectableTable.jsx';
import { Icon } from './Icon.jsx';
import { DateField } from './DateField.jsx';
import { CollapsibleSection } from './CollapsibleSection.jsx';

function Field({ field, form, setForm, aux }) {
  const value = form[field.name];
  const onChange = next => setForm(current => Object.assign({}, current, { [field.name]: next }));
  const options = typeof field.options === 'function' ? field.options({ form, aux }) : (field.options || []);
  const id = field.id || field.name;

  if (field.hidden) {
    return null;
  }

  if (field.type === 'textarea') {
    return (
      <div className="mb-3">
        <label className="form-label" htmlFor={id}>{field.label}</label>
        <textarea
          id={id}
          className="form-control"
          value={value || ''}
          onChange={event => onChange(event.target.value)}
          rows={field.rows || 3}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="mb-3">
        <label className="form-label" htmlFor={id}>{field.label}</label>
        <select
          id={id}
          className="form-select"
          value={value || ''}
          onChange={event => onChange(event.target.value)}
        >
          <option value="">{field.placeholder || `Select ${field.label}`}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="form-check mb-3">
        <input
          id={id}
          className="form-check-input"
          type="checkbox"
          checked={!!value}
          onChange={event => onChange(event.target.checked)}
        />
        <label className="form-check-label" htmlFor={id}>{field.label}</label>
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <DateField
        id={id}
        label={field.label}
        value={value || ''}
        onChange={onChange}
        min={field.min}
        max={field.max}
      />
    );
  }

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{field.label}</label>
      <input
        id={id}
        type={field.type || 'text'}
        className="form-control"
        value={value || ''}
        onChange={event => onChange(event.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  );
}

export function ManagerPage({
  bootstrap,
  title,
  activeNav,
  fields,
  columns,
  footerLabels,
  form,
  setForm,
  rows,
  selectedIds,
  setSelectedIds,
  onSubmit,
  onEdit,
  onDelete,
  message,
  error,
  submitLabel,
  loading,
  aux,
  intro,
  extraActions,
  leftActions,
  rightActions,
  tableActionsLeft,
  tableActionsRight,
  formSectionTitle,
  formSectionCollapsible = false,
  formSectionOpen,
  formSectionOnToggle,
  formSectionIconPosition = 'right',
  sortKey,
  sortDirection,
  onSortColumn,
  sectionBeforeTable,
  sectionAfterForm
}) {
  return (
    <Shell version={bootstrap.version} title={title} activeNav={activeNav} manager={bootstrap.manager}>
      {intro ? <div className="alert alert-info">{intro}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      {formSectionCollapsible ? (
        <CollapsibleSection
          title={formSectionTitle || 'Submit'}
          defaultOpen={true}
          open={formSectionOpen}
          onToggle={formSectionOnToggle}
          iconPosition={formSectionIconPosition}
        >
          {fields.map(field => (
            <Field key={field.name} field={field} form={form} setForm={setForm} aux={aux} />
          ))}
          <div className="d-flex flex-wrap justify-content-start gap-2 align-items-end mb-3">
            {leftActions || extraActions}
          </div>
          <div className="d-flex flex-wrap justify-content-end gap-2 align-items-end">
            {rightActions}
            <button type="button" className="btn btn-primary" onClick={onSubmit}>
              {submitLabel || 'Submit'}
            </button>
          </div>
        </CollapsibleSection>
      ) : (
        <section className="card border-0 shadow-sm mb-3">
          <div className="card-body">
            {fields.map(field => (
              <Field key={field.name} field={field} form={form} setForm={setForm} aux={aux} />
            ))}
            <div className="d-flex flex-wrap justify-content-start gap-2 align-items-end mb-3">
              {leftActions || extraActions}
            </div>
            <div className="d-flex flex-wrap justify-content-end gap-2 align-items-end">
              {rightActions}
              <button type="button" className="btn btn-primary" onClick={onSubmit}>
                {submitLabel || 'Submit'}
              </button>
            </div>
          </div>
        </section>
      )}

      {sectionAfterForm}

      <section className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex flex-wrap gap-2 align-items-center">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {tableActionsLeft}
            <button type="button" className="btn btn-outline-secondary" onClick={() => onEdit(setForm)}>
              <Icon name="edit-2" className="me-2" />
              Edit Selected
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onDelete}>
              <Icon name="trash-2" className="me-2" />
              Delete Selected
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center ms-auto">
            {tableActionsRight}
            {loading ? <span className="text-muted">Loading...</span> : null}
          </div>
        </div>
      </section>

      {sectionBeforeTable}

      <SelectableTable
        rows={rows}
        selectedKeys={selectedIds}
        onToggleRow={(row, checked) => {
          setSelectedIds(current => checked ? [...current, row.id] : current.filter(id => id !== row.id));
        }}
        onToggleAll={checked => {
          setSelectedIds(checked ? rows.map(row => row.id) : []);
        }}
        columns={columns}
        footerLabels={footerLabels}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortColumn={onSortColumn}
      />
    </Shell>
  );
}
