import React from 'react';
import { Icon } from './Icon.jsx';

export function DateField({ label, value, onChange, id, min, max }) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="mb-3">
      <label htmlFor={inputId} className="form-label d-flex align-items-center gap-1">
        <Icon name="calendar" />
        <span>{label}</span>
      </label>
      <input
        id={inputId}
        type="date"
        className="form-control"
        value={value}
        min={min}
        max={max}
        onChange={event => onChange(event.target.value)}
      />
    </div>
  );
}
