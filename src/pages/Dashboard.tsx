import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { adminApi, itemsApi, matchesApi } from '../services/api';
import { Item, Match, ReportStats } from '../types';
import ItemCard from '../components/ItemCard';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [highConfidenceMatches, setHighConfidenceMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes, matchesRes] = await Promise.allSettled([
          adminApi.getStats(),
          itemsApi.getItems(),
          matchesApi.getMatches()
        ]);
        
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value);
        }
        if (itemsRes.status === 'fulfilled') {
          setRecentItems(itemsRes.value.slice(0, 3));
        }
        if (matchesRes.status === 'fulfilled') {
          setHighConfidenceMatches(matchesRes.value.filter(m => m.finalScore > 85));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening on campus.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Lost Items" 
          value={stats?.totalLost || 0} 
          icon={AlertCircle} 
          trend="+5 this week"
          color="red"
        />
        <StatCard 
          title="Found Items" 
          value={stats?.totalFound || 0} 
          icon={FileText} 
          trend="+12 this week"
          color="emerald"
        />
        <StatCard 
          title="Potential Matches" 
          value={stats?.activeMatches || 0} 
          icon={TrendingUp} 
          trend="3 high confidence"
          color="indigo"
        />
        <StatCard 
          title="Resolved" 
          value={stats?.resolved || 0} 
          icon={CheckCircle} 
          trend="+8 this week"
          color="blue"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Items */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent Reports</h2>
              <Link to="/browse" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                View all <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {recentItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            
            {recentItems.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No recent reports found.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* High Confidence Matches */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Top Matches</h2>
              <Link to="/matches" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {highConfidenceMatches.length > 0 ? (
                highConfidenceMatches.map(match => (
                  <Link 
                    key={match.id} 
                    to={`/matches`}
                    className="block p-4 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-slate-900 line-clamp-1 pr-2">
                        {match.lostItem?.title}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 whitespace-nowrap">
                        {match.finalScore}% Match
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Matches found item: {match.foundItem?.title}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No high-confidence matches at the moment.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/report/lost" 
                className="flex items-center w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                <AlertCircle size={18} className="mr-3 text-red-400" />
                Report Lost Item
              </Link>
              <Link 
                to="/report/found" 
                className="flex items-center w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                <CheckCircle size={18} className="mr-3 text-emerald-400" />
                Report Found Item
              </Link>
              <Link 
                to="/browse" 
                className="flex items-center w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                <Search size={18} className="mr-3 text-indigo-400" />
                Browse Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start">
      <div className={cn("p-3 rounded-lg mr-4", colorMap[color])}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && (
          <p className="text-xs font-medium text-slate-400 mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
}
