import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatsCards from '../components/StatsCards';
import AttackLogs from '../components/AttackLogs';
import ThreatChart from '../components/ThreatChart';
import { getStats, getLogs, getRateLimitStatus } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPrompts: 0,
    blockedAttacks: 0,
    sanitizedPrompts: 0,
    allowedPrompts: 0,
    jailbreakAttempts: 0,
    injectionAttempts: 0,
  });
  const [logs, setLogs] = useState([]);
  const [rateLimitData, setRateLimitData] = useState({ blockedIPs: [], ipStats: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, logsData, rateLimitInfo] = await Promise.all([
        getStats(),
        getLogs(),
        getRateLimitStatus().catch(() => ({ blockedIPs: [], ipStats: [] })),
      ]);
      setStats(statsData);
      setLogs(logsData);
      setRateLimitData(rateLimitInfo);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full cyber-grid">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 cyber-grid">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            📊 Security Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time AI Firewall monitoring & analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 border border-gray-800/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-gray-400">Live Monitoring</span>
          </div>
          <button
            onClick={fetchData}
            className="glass border border-gray-800/20 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 hover:border-cyan-500/30"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Rate Limiting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
        {/* Blocked IPs */}
        <div className="glass rounded-2xl border border-orange-500/20 p-6">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            🔒 Blocked IPs
            <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">
              {rateLimitData.blockedIPs.length} active
            </span>
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {rateLimitData.blockedIPs.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-3xl mb-2 block">✅</span>
                <p className="text-gray-500 text-sm">No IPs currently blocked</p>
              </div>
            ) : (
              rateLimitData.blockedIPs.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-400 font-mono font-semibold text-sm">
                      🖥️ {entry.ip}
                    </span>
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full animate-pulse">
                      BLOCKED
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>⏳ {entry.remainingMinutes} min left</span>
                    <span>⚠️ {entry.violations} violations</span>
                    <span>🔒 Blocked {entry.totalBlocks}x</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: `${Math.max((entry.remainingSeconds / 900) * 100, 0)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* IP Threat Monitor */}
        <div className="glass rounded-2xl border border-gray-800/20 p-6">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            👁️ IP Threat Monitor
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
              {rateLimitData.ipStats.length} tracked
            </span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {rateLimitData.ipStats.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-3xl mb-2 block">🕵️</span>
                <p className="text-gray-500 text-sm">No suspicious activity detected</p>
              </div>
            ) : (
              rateLimitData.ipStats.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                >
                  <span className="text-lg">
                    {entry.isBlocked ? '🔴' : entry.recentViolations >= 3 ? '🟡' : '🟢'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm font-mono">{entry.ip}</p>
                    <p className="text-gray-500 text-xs">
                      {entry.recentViolations}/5 violations
                      {entry.totalBlocks > 0 && ` • Blocked ${entry.totalBlocks}x before`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      entry.isBlocked
                        ? 'bg-red-500/20 text-red-400'
                        : entry.recentViolations >= 3
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {entry.isBlocked
                      ? `${entry.remainingMinutes}m left`
                      : `${5 - entry.recentViolations} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <ThreatChart stats={stats} logs={logs} />

      {/* Logs */}
      <AttackLogs logs={logs} />
    </div>
  );
};

export default Dashboard;