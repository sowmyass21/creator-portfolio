import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import apiService from '../services/api';
import { Activity, RefreshCw, Clock } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const StatusBadge = () => {
  const { healthStatus } = usePortfolio();
  const [syncInfo, setSyncInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    apiService.getSyncStatus()
      .then(res => {
        if (isMounted && res.data) {
          setSyncInfo(res.data);
        }
      })
      .catch(() => {});
    
    return () => { isMounted = false; };
  }, []);

  if (!healthStatus) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50 animate-pulse">
        <Activity className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        Connecting API...
      </div>
    );
  }

  const isDbConnected = healthStatus.database?.connected;
  const lastSyncTime = syncInfo?.lastSyncTimestamp || syncInfo?.lastSuccessfulSync;

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300 ${
        isDbConnected 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
          : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
      }`}
      title={`Database: ${healthStatus.database?.name} | Sync Status: ${syncInfo?.currentSyncStatus || 'IDLE'}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isDbConnected ? 'bg-emerald-400' : 'bg-amber-400'
        }`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isDbConnected ? 'bg-emerald-500' : 'bg-amber-500'
        }`}></span>
      </span>
      <span className="font-mono text-[11px]">
        {isDbConnected ? 'MongoDB Connected' : 'Mock Mode'}
        {lastSyncTime && (
          <span className="hidden md:inline text-[10px] text-slate-400 ml-1">
            • Synced: {formatDate(lastSyncTime)}
          </span>
        )}
      </span>
    </div>
  );
};

export default StatusBadge;
