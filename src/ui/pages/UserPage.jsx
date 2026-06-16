import React, { useMemo, useState } from 'react';
import { Icon } from '../components/Icon.jsx';
import { ManagerPage } from '../components/ManagerPage.jsx';
import { useCrudManager } from '../hooks/useCrudManager.js';
import { getCsrfToken, requestJson } from '../lib/api.js';

function initialForm() {
  return {
    email: '',
    firstname: '',
    lastname: '',
    phone: '',
    is_manager: false
  };
}

function PasswordField({ id, label, value, onChange, visible, onToggleVisible }) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="input-group">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="form-control"
          value={value}
          onChange={event => onChange(event.target.value)}
          autoComplete="off"
        />
        <button type="button" className="btn btn-outline-secondary" onClick={onToggleVisible} aria-label={visible ? `Hide ${label}` : `Show ${label}`}>
          <Icon name={visible ? 'eye-off' : 'eye'} />
        </button>
      </div>
    </div>
  );
}

export function UserPage({ bootstrap }) {
  const [form, setForm] = useState(initialForm());
  const [isFormSectionOpen, setIsFormSectionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [passwordDialogError, setPasswordDialogError] = useState('');
  const [passwordDialogLoading, setPasswordDialogLoading] = useState(false);
  const manager = useCrudManager({
    listPath: '/users',
    loadPath: id => `/users/${id}`,
    createPath: '/users',
    updatePath: id => `/users/${id}`,
    deletePath: id => `/users/${id}`,
    initialForm,
    mapRecordToForm: record => ({
      email: record.email || '',
      firstname: record.firstname || '',
      lastname: record.lastname || '',
      phone: record.phone || '',
      is_manager: !!record.is_manager
    }),
    buildPayload: value => value
  });

  const columns = useMemo(() => [
    { key: 'id', label: 'Id', sortable: true, sortType: 'number' },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'firstname', label: 'Firstname', sortable: true },
    { key: 'lastname', label: 'Lastname', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'is_manager', label: 'IsManager', render: row => String(!!row.is_manager) }
  ], []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return manager.rows;
    }

    return manager.rows.filter(row => {
      const values = [row.id, row.email, row.firstname, row.lastname, row.phone];
      return values.some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [manager.rows, searchTerm]);

  const sortedRows = useMemo(() => {
    const direction = sortDirection === 'desc' ? -1 : 1;
    const compare = (left, right) => {
      const a = left[sortKey];
      const b = right[sortKey];
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

  const selectedUser = useMemo(() => (
    manager.rows.find(row => manager.selectedIds.includes(row.id)) || null
  ), [manager.rows, manager.selectedIds]);

  function openPasswordDialog() {
    if (manager.selectedIds.length !== 1) {
      manager.setError('Select exactly one row to change password.');
      return;
    }

    setPasswordDialogError('');
    setOldPassword('');
    setNewPassword('');
    setVerifyPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowVerifyPassword(false);
    manager.setError('');
    setIsPasswordDialogOpen(true);
  }

  function closePasswordDialog() {
    setIsPasswordDialogOpen(false);
    setPasswordDialogError('');
    setPasswordDialogLoading(false);
  }

  async function handleChangePassword() {
    if (!newPassword) {
      setPasswordDialogError('New Password is required.');
      return;
    }

    if (newPassword !== verifyPassword) {
      setPasswordDialogError('New Password and Verify Password must match.');
      return;
    }

    if (manager.selectedIds.length !== 1) {
      setPasswordDialogError('Select exactly one row to change password.');
      return;
    }

    try {
      setPasswordDialogLoading(true);
      setPasswordDialogError('');
      manager.setError('');
      const userId = manager.selectedIds[0];
      await requestJson(`/users/${userId}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({
          old_pass: oldPassword,
          new_pass: newPassword
        })
      });

      manager.setMessage('Password changed successfully.');
      closePasswordDialog();
      await manager.refresh();
    } catch (error) {
      const message = error.message || 'Failed to change password';
      setPasswordDialogError(message);
      manager.setError(message);
    } finally {
      setPasswordDialogLoading(false);
    }
  }

  async function handleSubmit() {
    try {
      if (!form.email) {
        manager.setError('Email is required field');
        return;
      }

      const method = manager.editingId ? 'PUT' : 'POST';
      const path = manager.editingId ? `/users/${manager.editingId}` : '/users';
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
      manager.setError(error.message || 'Failed to save login user');
    }
  }

  return (
    <>
    <ManagerPage
      bootstrap={bootstrap}
      title="Login User"
      activeNav="user"
      fields={[
        { name: 'email', label: 'Email' },
        { name: 'firstname', label: 'First Name' },
        { name: 'lastname', label: 'Last Name' },
        { name: 'phone', label: 'Phone' },
        { name: 'is_manager', label: 'This User Is Manager', type: 'checkbox' }
      ]}
      columns={columns}
      footerLabels={['Id', 'Email', 'Firstname', 'Lastname', 'Phone', 'IsManager']}
      form={form}
      setForm={setForm}
      rows={sortedRows}
      selectedIds={manager.selectedIds}
      setSelectedIds={manager.setSelectedIds}
      onSubmit={handleSubmit}
      onEdit={setter => {
        setIsFormSectionOpen(true);
        manager.editSelected(setter);
      }}
      onDelete={manager.deleteSelected}
      message={manager.message}
      error={manager.error}
      submitLabel={manager.editingId ? 'Update' : 'Submit'}
      loading={manager.loading}
      tableActionsLeft={
        <button type="button" className="btn btn-outline-secondary" onClick={openPasswordDialog}>
          <Icon name="key" className="me-2" />
          Change Password Selected
        </button>
      }
      tableActionsRight={
        <div className="d-flex flex-column align-items-end" style={{ width: '20%', minWidth: '240px' }}>
          <label className="form-label mb-1 w-100 text-end" htmlFor="login-user-search">Search Login User</label>
          <input
            id="login-user-search"
            type="search"
            className="form-control"
            placeholder="Search by email, name, or phone"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>
      }
      formSectionCollapsible={true}
      formSectionTitle="Submit Login User"
      formSectionOpen={isFormSectionOpen}
      formSectionOnToggle={setIsFormSectionOpen}
      formSectionIconPosition="right"
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={handleSortColumn}
    />

      {isPasswordDialogOpen ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1055 }}
          role="presentation"
          onClick={event => {
            if (event.target === event.currentTarget) {
              closePasswordDialog();
            }
          }}
        >
          <div className="card shadow" style={{ width: '100%', maxWidth: '560px' }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">Change Password Selected</div>
                {selectedUser ? <div className="text-muted small">{selectedUser.email}</div> : null}
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closePasswordDialog}>
                Close
              </button>
            </div>
            <div className="card-body">
              {passwordDialogError ? <div className="alert alert-danger">{passwordDialogError}</div> : null}
              <PasswordField
                id="old-password"
                label="Old Password"
                value={oldPassword}
                onChange={setOldPassword}
                visible={showOldPassword}
                onToggleVisible={() => setShowOldPassword(value => !value)}
              />
              <PasswordField
                id="new-password"
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggleVisible={() => setShowNewPassword(value => !value)}
              />
              <PasswordField
                id="verify-password"
                label="Verify Password"
                value={verifyPassword}
                onChange={setVerifyPassword}
                visible={showVerifyPassword}
                onToggleVisible={() => setShowVerifyPassword(value => !value)}
              />
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={closePasswordDialog} disabled={passwordDialogLoading}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleChangePassword} disabled={passwordDialogLoading}>
                  {passwordDialogLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
