import React, { useState } from 'react';
import { Icon } from './Icon.jsx';

const primaryNav = [
  ['dashboard', '/', 'home', 'Dashboard'],
  ['expense', '/manager/expense', 'dollar-sign', 'Expense'],
  ['import', '/manager/import', 'upload', 'Import'],
  ['work', '/manager/work', 'tool', 'Work'],
  ['vendor', '/manager/vendor', 'shopping-bag', 'Vendor'],
  ['tenant', '/manager/tenant', 'users', 'Tenant']
];

const managerNav = [
  ['property', '/manager/property', 'file-text', 'Property'],
  ['unit', '/manager/unit', 'file-text', 'Unit'],
  ['payment', '/manager/payment', 'credit-card', 'Payment'],
  ['user', '/manager/user', 'user-check', 'User']
];

export function Shell({ version, title, activeNav, manager, children }) {
  const [managerOpen, setManagerOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="/">
          Spark PM v{version}
        </a>
        <button
          className="navbar-toggler position-absolute d-md-none collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </header>
      <div className="container-fluid">
        <div className="row">
          <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                {primaryNav.map(([key, href, icon, label]) => (
                  <li className="nav-item" key={key}>
                    <a
                      className={`nav-link ${activeNav === key ? 'active' : ''}`}
                      aria-current={activeNav === key ? 'page' : undefined}
                      href={href}
                    >
                      <Icon name={icon} className="me-2" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>

              {manager ? (
                <>
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none px-3 py-0 mt-4 mb-1 sidebar-heading d-flex justify-content-between align-items-center w-100"
                    onClick={() => setManagerOpen(current => !current)}
                  >
                    <span>Manager Action</span>
                    <Icon name={managerOpen ? 'minus-circle' : 'plus-circle'} />
                  </button>
                  <div id="manager-nav" className={managerOpen ? '' : 'd-none'}>
                    <ul className="nav flex-column mb-2">
                      {managerNav.map(([key, href, icon, label]) => (
                        <li className="nav-item" key={key}>
                          <a
                            className={`nav-link ${activeNav === key ? 'active' : ''}`}
                            aria-current={activeNav === key ? 'page' : undefined}
                            href={href}
                          >
                            <Icon name={icon} className="me-2" />
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}

              <ul className="nav flex-column">
                <li className="nav-item">
                  <a id="nav-logout" className="nav-link" href="/logout">
                    <Icon name="log-out" className="me-2" />
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            <h1 className="h4">{title}</h1>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
