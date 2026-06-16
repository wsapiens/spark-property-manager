import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Icon } from '../components/Icon.jsx';
import { Shell } from '../components/Shell.jsx';
import { DateField } from '../components/DateField.jsx';
import { buildQuery, downloadBlob, requestJson, rowsToCsv } from '../lib/api.js';
import { formatDateInput, parseDateInput, startOfYearDate, todayDate } from '../lib/date.js';

function chartOptions(title, extra = {}) {
  return Object.assign({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title
      }
    }
  }, extra);
}

function csvFromDetailedReport(data) {
  if (!data || !Array.isArray(data.data) || data.data.length === 0) {
    return '';
  }

  return rowsToCsv(data.data);
}

function csvFromChartReport(data, labelKey, valueKey) {
  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets) || !data.datasets[0]) {
    return '';
  }

  return rowsToCsv(data.labels.map((label, index) => ({
    [labelKey]: label,
    [valueKey]: data.datasets[0].data[index]
  })));
}

export function DashboardPage({ bootstrap }) {
  const [startDate, setStartDate] = useState(formatDateInput(startOfYearDate()));
  const [endDate, setEndDate] = useState(formatDateInput(todayDate()));
  const [chartPayloads, setChartPayloads] = useState({ byType: null, byProperty: null, byTime: null });
  const [downloadLinks, setDownloadLinks] = useState({});
  const [showDownloadButtons, setShowDownloadButtons] = useState(false);
  const [error, setError] = useState('');
  const byTypeRef = useRef(null);
  const byPropertyRef = useRef(null);
  const byTimeRef = useRef(null);
  const chartRefs = useRef({});
  const chartCards = [
    ['Monthly Expense', byTimeRef],
    ['Expense by Property', byPropertyRef],
    ['Expense by Property And Type', byTypeRef]
  ];

  async function refreshCharts() {
    if (!requestParams) {
      return;
    }

    try {
      setError('');
      const [byType, byProperty, byTime] = await Promise.all([
        requestJson(`/expenses/types/properties/report${buildQuery(requestParams)}`),
        requestJson(`/expenses/properties/report${buildQuery(requestParams)}`),
        requestJson(`/expenses/times${buildQuery(requestParams)}`)
      ]);
      setChartPayloads({ byType, byProperty, byTime });
    } catch (loadError) {
      setError(loadError.message || 'Failed to load dashboard data');
    }
  }

  const requestParams = useMemo(() => {
    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);
    if (!start || !end) {
      return null;
    }

    return {
      start: formatDateInput(start),
      end: formatDateInput(end)
    };
  }, [startDate, endDate]);

  useEffect(() => {
    if (!requestParams) {
      return;
    }

    refreshCharts();
  }, [requestParams]);

  useEffect(() => {
    const configs = [
      ['byType', byTypeRef.current, chartPayloads.byType, 'bar', 'Expense By Property And Type', { indexAxis: 'y' }],
      ['byProperty', byPropertyRef.current, chartPayloads.byProperty, 'doughnut', 'Expense By Property', {}],
      ['byTime', byTimeRef.current, chartPayloads.byTime, 'bar', 'Expense By Month', {
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true }
        }
      }]
    ];

    configs.forEach(([key, canvas, payload, type, title, extra]) => {
      const existing = chartRefs.current[key];
      if (existing) {
        existing.destroy();
        delete chartRefs.current[key];
      }
      if (!canvas || !payload) {
        return;
      }

      chartRefs.current[key] = new Chart(canvas, {
        type,
        data: payload,
        options: chartOptions(title, extra)
      });
    });

    return () => {
      Object.values(chartRefs.current).forEach(chart => chart.destroy());
      chartRefs.current = {};
    };
  }, [chartPayloads]);

  async function handleGenerateReports() {
    try {
      setError('');
      setShowDownloadButtons(false);
      const query = buildQuery(requestParams);
      const [detailed, typeProperty, byProperty] = await Promise.all([
        requestJson(`/expenses/report${query}`),
        requestJson(`/expenses/types/properties/report${query}`),
        requestJson(`/expenses/properties/report${query}`)
      ]);

      setDownloadLinks({
        detailed: csvFromDetailedReport(detailed),
        typeProperty: csvFromChartReport(typeProperty, 'property_expense_type', 'amount'),
        byProperty: csvFromChartReport(byProperty, 'property_expense', 'amount')
      });
      setShowDownloadButtons(true);
    } catch (generateError) {
      setError(generateError.message || 'Failed to generate reports');
    }
  }

  function downloadGeneratedReport(csvText, filename) {
    if (!csvText) {
      return;
    }

    downloadBlob(new Blob([csvText], { type: 'text/csv' }), filename);
  }

  return (
    <Shell
      version={bootstrap.version}
      title="Dashboard"
      activeNav="dashboard"
      manager={bootstrap.manager}
    >
      {bootstrap.message ? <div className="alert alert-info">{bootstrap.message}</div> : null}
      {bootstrap.error_message ? <div className="alert alert-danger">{bootstrap.error_message}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      {chartCards.map(([title, ref], index) => (
        <section className="mb-4" key={title}>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5">{title}</h2>
              <div className={index === 0 || index === 1 || index === 2 ? 'chart-frame chart-frame-square' : 'chart-frame'}>
                <canvas
                  ref={ref}
                  className={index === 0 || index === 1 || index === 2 ? 'chart-canvas-fit' : ''}
                  height={index === 0 || index === 1 || index === 2 ? undefined : 180}
                ></canvas>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5">Select Dates To Review Expenses</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <DateField label="Start Date" value={startDate} onChange={setStartDate} id="start-date" />
            </div>
            <div className="col-md-6">
              <DateField label="End Date" value={endDate} onChange={setEndDate} id="end-date" />
            </div>
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setChartPayloads({ byType: null, byProperty: null, byTime: null })}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={refreshCharts}
            >
              Draw Charts
            </button>
            <button type="button" className="btn btn-outline-primary" onClick={() => setStartDate(formatDateInput(startOfYearDate()))}>
              Start of Year
            </button>
            <button type="button" className="btn btn-primary" onClick={handleGenerateReports}>
              Generate Reports
            </button>
          </div>
        </div>
      </section>

      {showDownloadButtons ? (
        <section className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => downloadGeneratedReport(downloadLinks.detailed, 'expense-report.csv')}
              >
                <Icon name="download" className="me-2" />
                Expense Report
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => downloadGeneratedReport(downloadLinks.typeProperty, 'expense-type-property-report.csv')}
              >
                <Icon name="download" className="me-2" />
                Property Expense Report
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => downloadGeneratedReport(downloadLinks.byProperty, 'expense-property-report.csv')}
              >
                <Icon name="download" className="me-2" />
                Expense Type and Property Report
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </Shell>
  );
}
