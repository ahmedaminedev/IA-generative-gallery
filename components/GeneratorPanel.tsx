import React, { useState } from 'react';
import { ProductConfig, GenerationStatus } from '../types';
import { THEME_PRESETS } from '../constants';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { SparklesIcon as SparklesOutline } from '@heroicons/react/24/outline';

interface GeneratorPanelProps {
  config: ProductConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProductConfig>>;
  onGenerate: () => void;
  onAutoDescription: () => Promise<void>;
  status: GenerationStatus;
  hasImage: boolean;
}

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ 
  config, 
  setConfig, 
  onGenerate, 
  onAutoDescription,
  status, 
  hasImage 
}) => {
  const isProcessing = status === GenerationStatus.LOADING;
  const [isWriting, setIsWriting] = useState(false);

  const handlePresetSelect = (preset: typeof THEME_PRESETS[0]) => {
    setConfig(prev => ({ ...prev, theme: preset.prompt }));
  };

  const handleAutoDescription = async () => {
    if (!hasImage || isWriting) return;
    setIsWriting(true);
    try {
      await onAutoDescription();
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => setConfig({ ...config, name: e.target.value })}
          placeholder="e.g. Eau de Rose, Serum Nuit..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all placeholder:text-gray-300"
        />
      </div>

      {/* Theme Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Aesthetic</label>
        <div className="grid grid-cols-1 gap-3">
          {THEME_PRESETS.map((preset) => {
            const isSelected = config.theme === preset.prompt;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 flex flex-col ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50 shadow-sm ring-1 ring-rose-500'
                    : 'border-gray-200 hover:border-rose-300 hover:bg-gray-50'
                }`}
              >
                <span className={`text-sm font-semibold ${isSelected ? 'text-rose-900' : 'text-gray-700'}`}>
                  {preset.name}
                </span>
                <span className={`text-xs ${isSelected ? 'text-rose-600' : 'text-gray-400'}`}>
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scene Description (Paragraph) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Scene Description</label>
          <button
            onClick={handleAutoDescription}
            disabled={!hasImage || isWriting}
            className={`text-xs flex items-center px-2 py-1 rounded-md transition-colors ${
              !hasImage 
                ? 'text-gray-300 cursor-not-allowed' 
                : isWriting
                  ? 'bg-rose-100 text-rose-600'
                  : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            {isWriting ? (
              <SparklesIcon className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <SparklesIcon className="w-3 h-3 mr-1" />
            )}
            {isWriting ? 'Writing...' : 'Auto-Write with AI'}
          </button>
        </div>
        <textarea
          value={config.description}
          onChange={(e) => setConfig({ ...config, description: e.target.value })}
          placeholder="Describe the mood, lighting, background, and environment in detail..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all placeholder:text-gray-300 h-28 resize-none text-sm leading-relaxed"
        />
      </div>

      {/* Custom Elements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Elements (Optional)</label>
        <input
          type="text"
          value={config.elements}
          onChange={(e) => setConfig({ ...config, elements: e.target.value })}
          placeholder="e.g. rose petals, water droplets..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all placeholder:text-gray-300"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!hasImage || !config.name || isProcessing}
        className={`w-full py-4 rounded-xl text-white font-medium text-lg shadow-lg shadow-rose-200 transition-all duration-300 flex items-center justify-center ${
          !hasImage || !config.name || isProcessing
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-rose-600 hover:bg-rose-700 hover:scale-[1.02]'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Gallery...
          </>
        ) : (
          <>
            <SparklesOutline className="w-5 h-5 mr-2" />
            Generate Gallery (5 Variations)
          </>
        )}
      </button>

      {!hasImage && <p className="text-xs text-center text-gray-400">Please upload a product image first.</p>}
    </div>
  );
};