export function getRootElement() {
  return document.getElementById('react-root');
}

export function getBootstrapData() {
  const root = getRootElement();
  if (!root) {
    return {};
  }

  const raw = root.dataset.bootstrap || '';
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (error) {
    console.error('Failed to parse bootstrap data', error);
    return {};
  }
}

export function getCsrfToken() {
  const bootstrap = getBootstrapData();
  if (bootstrap.csrfToken) {
    return bootstrap.csrfToken;
  }

  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
}

export function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    method: options.method || 'GET',
    headers: Object.assign({
      'Accept': 'application/json'
    }, options.headers || {}),
    body: options.body
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || response.statusText);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function requestBlob(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    method: options.method || 'GET',
    headers: Object.assign({}, options.headers || {}),
    body: options.body
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || response.statusText);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  return response.blob();
}

export function csvEscape(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export function rowsToCsv(rows) {
  if (!rows || rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach(row => {
    lines.push(headers.map(key => csvEscape(row[key])).join(','));
  });
  return lines.join('\n');
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
