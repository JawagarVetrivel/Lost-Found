import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CATEGORIES, LOCATIONS } from '../lib/constants';
import { itemsApi, uploadApi } from '../services/api';

interface ReportFormProps {
  type: 'lost' | 'found';
}

export default function ReportForm({ type }: ReportFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    brand: '',
    color: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.title.trim()) {
      setError("Please enter the item title or name.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.category) {
      setError("Please select a category from the list.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.location) {
      setError("Please select an approximate campus location.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      setError("Please provide a detailed description (at least 5 characters).");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        try {
          const uploadRes = await uploadApi.uploadImage(imageFile);
          imageUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Image upload error:', uploadErr);
        }
      }

      const itemPayload = {
        ...formData,
        imageUrl,
      };

      if (type === 'lost') {
        await itemsApi.createLostItem(itemPayload);
      } else {
        await itemsApi.createFoundItem(itemPayload);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      console.error("Failed to create report", err);
      setError(err?.message || "Failed to create report. Please verify all details and try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Report {type === 'lost' ? 'Lost' : 'Found'} Item
        </h1>
        <p className="text-slate-500 mt-1">
          Provide as much detail as possible to help our AI matching system.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span className="font-medium">
            Report submitted successfully! Redirecting to dashboard...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Basic Information
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Apple AirPods Pro, Blue Nike Backpack"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="text"
                  name="color"
                  placeholder="e.g. Black, Silver, Red"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Brand (if applicable)
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Apple, Nike, Hydro Flask"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Include any distinguishing marks, scratches, contents (for bags), or specific features..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          {/* Time & Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Time & Location
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Campus Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="" disabled>Select approximate location</option>
                  {LOCATIONS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Approximate Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Photo
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload Image (Optional but highly recommended)
              </label>
              
              {imagePreview ? (
                <div className="relative w-full max-w-sm h-48 rounded-lg overflow-hidden border border-slate-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-slate-700 hover:text-red-600 hover:bg-white backdrop-blur-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-1 text-sm text-slate-500 font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
