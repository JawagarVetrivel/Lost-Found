import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../types';
import { formatDate } from '../lib/utils';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ItemCardProps {
  item: Item;
  key?: React.Key;
}

export default function ItemCard({ item }: ItemCardProps) {
  const isLost = item.type === 'lost';
  
  return (
    <Link 
      to={`/item/${item.id}`}
      className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="relative h-48 w-full bg-slate-100">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3 flex space-x-2">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-sm",
            isLost 
              ? "bg-red-100/90 text-red-700 border border-red-200/50" 
              : "bg-emerald-100/90 text-emerald-700 border border-emerald-200/50"
          )}>
            {isLost ? 'Lost' : 'Found'}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
            {item.title}
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
            {item.category}
          </span>
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
          {item.description}
        </p>
        
        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1.5 text-slate-400" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5 text-slate-400" />
            <span>{formatDate(item.date)}</span>
            <span className="mx-1.5">•</span>
            <Clock size={14} className="mr-1.5 text-slate-400" />
            <span>{item.time}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
