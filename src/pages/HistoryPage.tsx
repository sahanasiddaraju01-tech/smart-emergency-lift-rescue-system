import React, { useState } from 'react';
import {
  History,
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
} from 'lucide-react';
import { EmergencyRecord, SystemLog } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface HistoryPageProps {
  emergencies: EmergencyRecord[];
  logs: SystemLog[];
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ emergencies, logs }) => {
  const [activeView, setActiveView] = useState<'emergencies' | 'logs'>('emergencies');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredEmergencies = emergencies.filter((emg) => {
    const matchesSearch =
      emg.elevator_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emg.emergency_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emg.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || emg.emergency_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredLogs = logs.filter((l) => {
    return (
      l.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Elevator', 'Type', 'Detected', 'Resolved', 'Status', 'Response Time (s)', 'Passengers', 'Exit Used'];
    const rows = filteredEmergencies.map((e) => [
      e.id,
      e.elevator_id,
      `"${e.emergency_type}"`,
      e.detected_time,
      e.resolved_time || 'N/A',
      e.status,
      e.response_time ?? 'N/A',
      e.passenger_count,
      e.exit_used ? 'YES (Case A)' : 'NO (Case B)',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_lift_emergencies_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              SQLite Audit Trail & Emergency Event Logs
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persistent incident logs, response durations, exit utilization records stored in SQLite database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveView('emergencies')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeView === 'emergencies' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Emergencies ({emergencies.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('logs')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeView === 'logs' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System Logs ({logs.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, failure type, or keyword..."
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:max-w-md"
          />
        </div>

        {activeView === 'emergencies' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Emergency Types</option>
              <option value="Power Failure">Power Failure</option>
              <option value="Electrical Fault">Electrical Fault</option>
              <option value="Door Fault">Door Fault</option>
              <option value="Elevator Stopped Between Floors">Elevator Stopped Between Floors</option>
              <option value="Communication Failure">Communication Failure</option>
              <option value="Multiple Passenger Emergency">Multiple Passenger Emergency</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Table View */}
      {activeView === 'emergencies' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Inc. ID</th>
                  <th className="py-3 px-4">Car ID</th>
                  <th className="py-3 px-4">Emergency Type</th>
                  <th className="py-3 px-4">Detected</th>
                  <th className="py-3 px-4">Resolved</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Load</th>
                  <th className="py-3 px-4">Exit Used</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEmergencies.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No emergency records match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredEmergencies.map((emg) => (
                    <tr key={emg.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">#{emg.id}</td>
                      <td className="py-3 px-4 text-cyan-400 font-medium">{emg.elevator_id}</td>
                      <td className="py-3 px-4 text-slate-200 font-medium">{emg.emergency_type}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(emg.detected_time).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {emg.resolved_time ? new Date(emg.resolved_time).toLocaleTimeString() : 'In Progress'}
                      </td>
                      <td className="py-3 px-4 text-amber-300 font-bold">
                        {emg.response_time !== null ? `${emg.response_time}s` : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {emg.passenger_count} souls
                      </td>
                      <td className="py-3 px-4">
                        {emg.exit_used ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                            YES (CASE A)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px]">
                            NO (LOCKED)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={emg.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Event Classification</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Audit Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No system logs match search query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">#{log.id}</td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{log.event_type}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-200">{log.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
