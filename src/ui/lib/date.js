export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function formatDateInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate())
  ].join('-');
}

export function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function startOfYearDate() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

export function todayDate() {
  return new Date();
}
