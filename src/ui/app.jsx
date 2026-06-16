import React from 'react';
import { createRoot } from 'react-dom/client';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { ExpensePage } from './pages/ExpensePage.jsx';
import { ImportPage } from './pages/ImportPage.jsx';
import { PropertyPage } from './pages/PropertyPage.jsx';
import { UnitPage } from './pages/UnitPage.jsx';
import { VendorPage } from './pages/VendorPage.jsx';
import { PaymentPage } from './pages/PaymentPage.jsx';
import { UserPage } from './pages/UserPage.jsx';
import { TenantPage } from './pages/TenantPage.jsx';
import { WorkPage } from './pages/WorkPage.jsx';
import { getBootstrapData, getRootElement } from './lib/api.js';

function App() {
  const root = getRootElement();
  const page = root ? root.dataset.page : '';
  const bootstrap = Object.assign({
    manager: false,
    version: '',
    title: ''
  }, getBootstrapData());

  if (page === 'import') {
    return <ImportPage bootstrap={bootstrap} />;
  }

  if (page === 'expense') {
    return <ExpensePage bootstrap={bootstrap} />;
  }

  if (page === 'property') {
    return <PropertyPage bootstrap={bootstrap} />;
  }

  if (page === 'unit') {
    return <UnitPage bootstrap={bootstrap} />;
  }

  if (page === 'vendor') {
    return <VendorPage bootstrap={bootstrap} />;
  }

  if (page === 'payment') {
    return <PaymentPage bootstrap={bootstrap} />;
  }

  if (page === 'user') {
    return <UserPage bootstrap={bootstrap} />;
  }

  if (page === 'tenant') {
    return <TenantPage bootstrap={bootstrap} />;
  }

  if (page === 'work') {
    return <WorkPage bootstrap={bootstrap} />;
  }

  return <DashboardPage bootstrap={bootstrap} />;
}

const root = getRootElement();
if (root) {
  createRoot(root).render(<App />);
}
