import React from 'react';
import { NAVIGATION_ITEMS } from '../constants';
import { AppView } from '../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-8 flex items-center space-x-2">
        <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold font-serif italic">
          L
        </div>
        <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">Lumière<span className="text-rose-500">.</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => item.id !== 'SETTINGS' && onChangeView(item.id as AppView)} // Settings disabled for demo
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-rose-50 text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-3 ${
                  isActive ? 'text-rose-500' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg shadow-rose-200">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">Pro Plan</p>
          <p className="text-sm font-semibold mb-3">Upgrade for 4K Export</p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors">
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
};