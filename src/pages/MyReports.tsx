import React, { useState, useEffect } from 'react';
import { itemsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Item } from '../types';
import ItemCard from '../components/ItemCard';

export default function MyReports() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'resolved'>('lost');

  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await itemsApi.getItems({ userId: user.id });
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch user items", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  }, [user]);

  const filteredItems = items.filter(item => {
    if (activeTab === 'resolved') return item.status === 'resolved' || item.status === 'claimed';
    return item.type === activeTab && item.status === 'active';
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Reports</h1>
        <p className="text-slate-500 mt-1">Manage the items you have reported lost or found.</p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {(['lost', 'found', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab} Items
            </button>
          ))}
        </nav>
      </div>

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
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No {activeTab} items</h3>
          <p className="text-slate-500">You don't have any {activeTab} items right now.</p>
        </div>
      )}
    </div>
  );
}
