import React, { useState } from 'react';
import { Icon } from './Icon.jsx';

export function CollapsibleSection({
  title,
  defaultOpen = true,
  open: controlledOpen,
  onToggle,
  iconPosition = 'right',
  children
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = typeof controlledOpen === 'boolean' ? controlledOpen : uncontrolledOpen;
  const setOpen = typeof controlledOpen === 'boolean' ? onToggle : setUncontrolledOpen;

  return (
    <section className="card border-0 shadow-sm mb-3">
      <button
        type="button"
        className="card-header bg-transparent border-0 text-start d-flex align-items-center justify-content-between"
        onClick={() => setOpen(value => !value)}
      >
        {iconPosition === 'left' ? (
          <span className="d-flex align-items-center gap-2">
            <Icon name={open ? 'minus-circle' : 'plus-circle'} />
            <span className="fw-semibold">{title}</span>
          </span>
        ) : (
          <>
            <span className="fw-semibold">{title}</span>
            <Icon name={open ? 'minus-circle' : 'plus-circle'} />
          </>
        )}
      </button>
      {open ? <div className="card-body">{children}</div> : null}
    </section>
  );
}
