import React from 'react';

export function Dialog({ title, visible, children, onClose, actions }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            {actions}
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
