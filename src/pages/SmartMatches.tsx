import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchesApi } from '../services/api';
import { Match, Item } from '../types';
import { Zap, Check, X, ExternalLink, Calendar, MapPin, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SmartMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchesApi.getMatches();
        setMatches(data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  const handleDismiss = async (id: string) => {
    try {
      await matchesApi.dismissMatch(id);
      setMatches(matches.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to dismiss match:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Zap className="mr-2 text-indigo-600" /> Smart Matches
        </h1>
        <p className="text-slate-500 mt-1">
          Our AI constantly analyzes reports to find potential connections. Review the high-confidence matches below.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-8">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} onDismiss={() => handleDismiss(match.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No active matches found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Our system is constantly scanning. We'll notify you when a high-confidence match is detected for your reports.
          </p>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, onDismiss }: { match: Match, onDismiss: () => void, key?: React.Key }) {
  const { lostItem, foundItem } = match;
  if (!lostItem || !foundItem) return null;

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl overflow-hidden shadow-md shadow-indigo-100/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-indigo-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-16 h-16 circular-chart">
              <path
                className="text-slate-200"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={cn(
                  "stroke-current",
                  match.finalScore >= 90 ? "text-emerald-500" : "text-amber-500"
                )}
                strokeWidth="3"
                strokeDasharray={`${match.finalScore}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-900">{match.finalScore}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Potential Match Found</h3>
            <p className="text-sm text-slate-500">Based on description, location, and timeframe</p>
          </div>
        </div>
        <div className="hidden sm:flex space-x-2">
          <button onClick={onDismiss} className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-md">
            Dismiss
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center">
            Review Match
          </button>
        </div>
      </div>

      {/* Comparison Body */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8 relative">
          
          {/* VS Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-slate-100 rounded-full items-center justify-center z-10 font-bold text-slate-400 shadow-sm">
            VS
          </div>

          {/* Lost Item */}
          <div className="space-y-4">
            <div className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded uppercase tracking-wider border border-red-100">
              Reported Lost
            </div>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                {lostItem.imageUrl ? (
                  <img src={lostItem.imageUrl} alt={lostItem.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 line-clamp-1">{lostItem.title}</h4>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1 mb-2">{lostItem.description}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center"><MapPin size={12} className="mr-1" /> {lostItem.location}</div>
                  <div className="flex items-center"><Calendar size={12} className="mr-1" /> {lostItem.date} {lostItem.time}</div>
                </div>
              </div>
            </div>
            <Link to={`/item/${lostItem.id}`} className="text-sm text-indigo-600 font-medium flex items-center hover:underline">
              View full details <ExternalLink size={14} className="ml-1" />
            </Link>
          </div>

          {/* Found Item */}
          <div className="space-y-4 md:pl-4">
            <div className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded uppercase tracking-wider border border-emerald-100">
              Reported Found
            </div>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                {foundItem.imageUrl ? (
                  <img src={foundItem.imageUrl} alt={foundItem.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 line-clamp-1">{foundItem.title}</h4>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1 mb-2">{foundItem.description}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-center"><MapPin size={12} className="mr-1" /> {foundItem.location}</div>
                  <div className="flex items-center"><Calendar size={12} className="mr-1" /> {foundItem.date} {foundItem.time}</div>
                </div>
              </div>
            </div>
            <Link to={`/item/${foundItem.id}`} className="text-sm text-indigo-600 font-medium flex items-center hover:underline">
              View full details <ExternalLink size={14} className="ml-1" />
            </Link>
          </div>
        </div>

        {/* AI Analysis Breakdown */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
            <Zap size={16} className="mr-1 text-indigo-500" />
            AI Match Analysis
          </h4>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            <ul className="space-y-2">
              {match.reasons.slice(0, 3).map((reason, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600">
                  <Check size={16} className="text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {match.reasons.slice(3).map((reason, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600">
                  <Check size={16} className="text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Mobile Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex sm:hidden space-x-3">
          <button onClick={onDismiss} className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md">
            Dismiss
          </button>
          <button className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">
            Review Match
          </button>
        </div>
      </div>
    </div>
  );
}
