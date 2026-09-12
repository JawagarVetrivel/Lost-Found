import React, { useState } from 'react';
import { X, Upload, Loader2, Info } from 'lucide-react';
import { Item } from '../types';
import { claimsApi, uploadApi } from '../services/api';

interface ClaimDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
}

export default function ClaimDialog({ isOpen, onClose, item }: ClaimDialogProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const isLost = item.type === 'lost';
  const title = isLost ? 'Contact Item Owner' : 'Claim This Item';
  const description = isLost 
    ? 'Provide details about where and when you found this item to help the owner verify it.' 
    : 'Provide specific details that only the true owner would know to prove this is yours.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let proofImageUrl: string | undefined;
      if (proofFile) {
        try {
          const uploadRes = await uploadApi.uploadImage(proofFile);
          proofImageUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Proof image upload error:', uploadErr);
        }
      }

      await claimsApi.createClaim({
        itemId: item.id,
        message,
        proofImageUrl,
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit claim', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
            <p className="text-slate-600 mb-6">
              The reporter has been notified. They will review your message and contact you if it's a match.
            </p>
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start">
                <Info size={20} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800">{description}</p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isLost ? "I found an item matching this description..." : "This is my item because..."}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proof Image (Optional)
                </label>
                <label className="flex items-center justify-center w-full px-4 py-2 border border-slate-300 border-dashed rounded-md cursor-pointer hover:bg-slate-50 text-sm font-medium text-slate-600">
                  <Upload size={16} className="mr-2" />
                  {proofFile ? proofFile.name : 'Upload a photo'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-70 flex items-center"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                  Submit
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
