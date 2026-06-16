import { useCallback, useEffect, useState } from 'react';
import { getCsrfToken, requestJson } from '../lib/api.js';

export function useCrudManager({
  listPath,
  loadPath,
  createPath,
  updatePath,
  deletePath,
  initialForm,
  mapRecordToForm,
  buildPayload
}) {
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await requestJson(listPath);
      setRows(response.data || []);
      setSelectedIds([]);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [listPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = useCallback(async (form, resetForm) => {
    try {
      const payload = buildPayload(form);
      const method = editingId ? 'PUT' : 'POST';
      const path = editingId ? updatePath(editingId) : createPath;
      await requestJson(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(payload)
      });
      setMessage('Saved successfully.');
      setError('');
      setEditingId(null);
      if (typeof resetForm === 'function') {
        resetForm(initialForm());
      }
      await refresh();
    } catch (saveError) {
      setError(saveError.message || 'Failed to save');
    }
  }, [buildPayload, createPath, editingId, initialForm, refresh, updatePath]);

  const editSelected = useCallback(async setForm => {
    if (selectedIds.length !== 1) {
      setError('Select exactly one row to edit.');
      return;
    }

    try {
      const record = await requestJson(loadPath(selectedIds[0]));
      setEditingId(selectedIds[0]);
      setError('');
      setMessage('');
      setForm(mapRecordToForm(record));
    } catch (loadError) {
      setError(loadError.message || 'Failed to load record');
    }
  }, [loadPath, mapRecordToForm, selectedIds]);

  const deleteSelected = useCallback(async () => {
    try {
      const csrf = getCsrfToken();
      await Promise.all(selectedIds.map(id => requestJson(deletePath(id), {
        method: 'DELETE',
        headers: {
          'CSRF-Token': csrf
        }
      })));
      setMessage('Deleted successfully.');
      setError('');
      setEditingId(null);
      setSelectedIds([]);
      await refresh();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete');
    }
  }, [deletePath, refresh, selectedIds]);

  return {
    rows,
    selectedIds,
    setSelectedIds,
    editingId,
    setEditingId,
    message,
    error,
    setMessage,
    setError,
    loading,
    refresh,
    submit,
    editSelected,
    deleteSelected
  };
}
