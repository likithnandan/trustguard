import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Activity, ShieldCheck, Cpu, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import {
  DateFilter,
  KPIGrid,
  TrustScoreCard,
  TrustTrendChart,
  DeviceStatusCard,
  DeviceOverviewTable,
  AlertSummary,
} from '../components/dashboard';

export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceTabs, setDeviceTabs] = useState([]);
  const [activeDeviceFilter, setActiveDeviceFilter] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('7d');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  // Fetch all dashboard data concurrently
  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      const queryParams = {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      };

      const [summaryRes, devicesRes, trendRes, alertsRes] = await Promise.allSettled([
        dashboardApi.getDashboardSummary(queryParams),
        dashboardApi.getDashboardDevices(queryParams),
        dashboardApi.getTrustTrend({ period: trendPeriod, ...queryParams }),
        dashboardApi.getDashboardAlerts({ category: 'All', ...queryParams }),
      ]);

      if (!isMountedRef.current) return;

      if (summaryRes.status === 'fulfilled') {
        const s = summaryRes.value;
        setKpis(s?.kpis || s?.summary || s);
      }
      if (devicesRes.status === 'fulfilled') {
        const d = devicesRes.value;
        setDevices(d?.devices || (Array.isArray(d) ? d : []));
        if (d?.tabs) setDeviceTabs(d.tabs);
      }
      if (trendRes.status === 'fulfilled') {
        setTrendData(trendRes.value);
      }
      if (alertsRes.status === 'fulfilled') {
        const a = alertsRes.value;
        setAlerts(a?.alerts || (Array.isArray(a) ? a : []));
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      if (isMountedRef.current) {
        setError('Unable to synchronize with TrustGuard backend. Retrying in background...');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [dateRange, trendPeriod]);

  // Initial load and trend period / date range watcher
  useEffect(() => {
    isMountedRef.current = true;
    loadDashboardData();

    // 5-second polling interval with cleanup
    const intervalId = setInterval(() => {
      loadDashboardData(false);
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [loadDashboardData]);

  // Handle single alert acknowledgement
  const handleAcknowledgeAlert = async (alertId) => {
    try {
      // Optimistic update
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setKpis((prev) => {
        if (!prev) return prev;
        const total = Math.max(0, (prev.alerts?.total || 1) - 1);
        return {
          ...prev,
          alerts: { ...prev.alerts, total },
        };
      });

      await dashboardApi.acknowledgeAlert(alertId);
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
      loadDashboardData(false);
    }
  };

  // Handle acknowledge all alerts
  const handleAcknowledgeAll = async () => {
    try {
      setAlerts([]);
      setKpis((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          alerts: { ...prev.alerts, total: 0, critical: 0, warning: 0 },
        };
      });

      await dashboardApi.acknowledgeAllAlerts();
    } catch (err) {
      console.error('Failed to acknowledge all alerts:', err);
      loadDashboardData(false);
    }
  };

  // Handle trend period switch
  const handlePeriodChange = async (newPeriod) => {
    setTrendPeriod(newPeriod);
    try {
      const res = await dashboardApi.getTrustTrend({
        period: newPeriod,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      if (res) {
        setTrendData(res);
      }
    } catch (err) {
      console.error('Failed to load trust trend for period:', newPeriod, err);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  return (
    <main style={{ padding: '24px 28px', flex: 1, minWidth: 0, overflowY: 'auto' }}>
      {/* Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={22} color="var(--accent)" />
            Continuous Trust Operations Dashboard
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px' }}>
            Multi-source IoMT verification, telemetry analysis, and continuous trust evaluations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <DateFilter onFilterChange={handleDateRangeChange} />

          <button
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '12.5px',
              fontWeight: '500',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={`Last polled: ${lastUpdated.toLocaleTimeString()}`}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            background: 'var(--red-bg)',
            border: '1px solid var(--red)',
            borderRadius: '8px',
            color: 'var(--red)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <KPIGrid kpis={kpis} isLoading={isLoading} />

      {/* Primary Analytics Row: Trust Score Index + Historical Trend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <TrustScoreCard kpis={kpis} />
        <TrustTrendChart
          trendData={trendData}
          period={trendPeriod}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Operational Highlights Cards */}
      <DeviceStatusCard kpis={kpis} />

      {/* Main Grid: Device Overview Table & Live Security Alerts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        <DeviceOverviewTable
          devices={devices}
          tabs={deviceTabs.length > 0 ? deviceTabs : [
            { label: 'All Devices', n: devices.length, key: 'all' },
            { label: 'Trusted', n: devices.filter((d) => d.color === 'green').length, key: 'green' },
            { label: 'At Risk', n: devices.filter((d) => d.color === 'amber').length, key: 'amber' },
            { label: 'Critical', n: devices.filter((d) => d.color === 'red').length, key: 'red' },
            { label: 'Inactive', n: devices.filter((d) => d.color === 'gray').length, key: 'gray' },
          ]}
          activeFilter={activeDeviceFilter}
          onFilterChange={setActiveDeviceFilter}
          isLoading={isLoading}
        />
        <AlertSummary
          alerts={alerts}
          onAcknowledge={handleAcknowledgeAlert}
          onAcknowledgeAll={handleAcknowledgeAll}
          isLoading={isLoading}
        />
      </div>

      {/* Footer System Status */}
      <div
        style={{
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px',
          color: 'var(--muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
          <span>Trust Engine Active · Real-Time Dynamic Inpatient & Device Evaluations</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)' }}>
          Policy: 0.45 DT + 0.55 DA · Decisions: ≥80 Accept | 50-79 Monitor | &lt;50 Isolate
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
