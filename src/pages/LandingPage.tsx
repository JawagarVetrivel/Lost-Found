import React from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, HeartHandshake, ShieldCheck, Zap, UserCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 py-4 px-6 sm:px-8 lg:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="font-semibold text-xl text-slate-900">
            Campus Find
          </span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">
            Log in
          </Link>
          <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-16 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-8">
            <Zap size={16} className="mr-2" />
            Powered by AI Smart Matching
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-8">
            The Smart Way to <span className="text-indigo-600">Find What You Lost</span> on Campus
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            Campus Find uses intelligent matching to automatically connect lost items with found ones, helping you get your belongings back faster.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/report/lost" className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg">
              <PlusCircle className="mr-2" size={20} />
              Report Lost Item
            </Link>
            <Link to="/report/found" className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 md:text-lg">
              <HeartHandshake className="mr-2" size={20} />
              Report Found Item
            </Link>
            <Link to="/browse" className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 md:text-lg">
              <Search className="mr-2" size={20} />
              Browse Items
            </Link>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">How Smart Matching Works</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Our backend uses advanced text and image analysis to automatically suggest potential matches between lost and found reports.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <PlusCircle size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Report</h3>
                <p className="text-slate-600">
                  Submit a detailed report of what you lost or found. Add photos, location, and time to improve match accuracy.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center relative">
                <div className="hidden md:block absolute top-1/2 -left-5 w-10 h-0.5 bg-slate-200"></div>
                <div className="hidden md:block absolute top-1/2 -right-5 w-10 h-0.5 bg-slate-200"></div>
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Auto-Match</h3>
                <p className="text-slate-600">
                  Our system continuously analyzes all active reports and generates a confidence score for potential matches.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Claim & Connect</h3>
                <p className="text-slate-600">
                  When a high-confidence match is found, you get notified. Submit a claim and connect safely to return the item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <span className="font-medium text-slate-900">
              Campus Find
            </span>
          </div>
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Campus Lost & Found. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-slate-500">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-slate-500">Terms</a>
            <a href="#" className="text-slate-400 hover:text-slate-500">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
