import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { itemsApi } from '../services/api';
import { Item } from '../types';
import ItemCard from '../components/ItemCard';
import { CATEGORIES, LOCATIONS } from '../lib/constants';

export default function BrowseItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    location: 'all',
    status: 'active'
  });

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const data = await itemsApi.getItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      location: 'all',
      status: 'active'
    });
    setSearchQuery('');
  };

  const filteredItems = items.filter(item => {
    // Search match
    const searchMatch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Filter match
    const typeMatch = filters.type === 'all' || item.type === filters.type;
    const categoryMatch = filters.category === 'all' || item.category === filters.category;
    const locationMatch = filters.location === 'all' || item.location === filters.location;
    const statusMatch = filters.status === 'all' || item.status === filters.status;
    
    return searchMatch && typeMatch && categoryMatch && locationMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Items</h1>
          <p className="text-slate-500 mt-1">Search through all reported lost and found items.</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, description, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 font-medium"
          >
            <Filter size={18} className="mr-2" />
            Filters
            {(filters.type !== 'all' || filters.category !== 'all' || filters.location !== 'all') && (
              <span className="ml-2 w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="lost">Lost Only</option>
                <option value="found">Found Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none bg-white"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Location</label>
              <select 
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none bg-white"
              >
                <option value="all">All Locations</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="sm:col-span-2 md:col-span-4 flex justify-end">
              <button 
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:text-slate-900 flex items-center"
              >
                <X size={14} className="mr-1" /> Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No items found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button 
            onClick={clearFilters}
            className="mt-6 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
}
