import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Palette, 
  ArrowLeft, 
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { itemsApi } from '../services/api';
import { Item } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, cn } from '../lib/utils';
import ClaimDialog from '../components/ClaimDialog';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await itemsApi.getItemById(id);
        if (data) setItem(data);
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Item not found</h2>
        <p className="text-slate-500 mb-6">The item you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/browse')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const isOwner = user?.id === item.userId;
  const isLost = item.type === 'lost';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} className="mr-1" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="h-64 md:h-auto bg-slate-100 relative">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
                    <Tag size={24} className="text-slate-400" />
                  </div>
                  <p>No image provided</p>
                </div>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-bold shadow-sm backdrop-blur-md",
                isLost 
                  ? "bg-red-500 text-white" 
                  : "bg-emerald-500 text-white"
              )}>
                {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
              </span>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-bold shadow-sm backdrop-blur-md",
                item.status === 'active' ? "bg-white/90 text-slate-700" :
                item.status === 'resolved' ? "bg-blue-500 text-white" :
                "bg-slate-800 text-white"
              )}>
                {item.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 uppercase tracking-wider">
                {item.category}
              </span>
              <span className="text-xs text-slate-400">
                Reported {formatDate(item.createdAt)}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              {item.title}
            </h1>
            
            <div className="prose prose-sm text-slate-600 mb-8 flex-1">
              <p className="whitespace-pre-wrap">{item.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start">
                <MapPin size={18} className="text-slate-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Location</p>
                  <p className="text-sm text-slate-900 font-medium">{item.location}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar size={18} className="text-slate-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Date</p>
                  <p className="text-sm text-slate-900 font-medium">{formatDate(item.date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock size={18} className="text-slate-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Time</p>
                  <p className="text-sm text-slate-900 font-medium">{item.time}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Palette size={18} className="text-slate-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Color / Brand</p>
                  <p className="text-sm text-slate-900 font-medium">
                    {item.color || 'N/A'} {item.brand ? `/ ${item.brand}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200">
              {item.status !== 'active' ? (
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-600 font-medium flex items-center justify-center">
                  <CheckCircle size={18} className="mr-2 text-blue-500" />
                  This item has been {item.status}
                </div>
              ) : isOwner ? (
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                    Edit Report
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                    Mark Resolved
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsClaimDialogOpen(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium shadow-sm transition-colors"
                >
                  {isLost ? (
                    <>
                      <AlertTriangle size={18} className="mr-2" />
                      I found this item
                    </>
                  ) : (
                    <>
                      <MessageSquare size={18} className="mr-2" />
                      This is my item
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ClaimDialog 
        isOpen={isClaimDialogOpen} 
        onClose={() => setIsClaimDialogOpen(false)} 
        item={item} 
      />
    </div>
  );
}
