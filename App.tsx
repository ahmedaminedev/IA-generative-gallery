import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ImageUpload } from './components/ImageUpload';
import { GeneratorPanel } from './components/GeneratorPanel';
import { AppView, GenerationStatus, ProductConfig } from './types';
import { generateProductGallery, generateSceneDescription } from './services/geminiService';
import { THEME_PRESETS } from './constants';
import { ArrowDownTrayIcon, SparklesIcon, ExclamationTriangleIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.GENERATOR);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // State for Gallery
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState<ProductConfig>({
    name: '',
    theme: THEME_PRESETS[0].prompt,
    description: '',
    elements: ''
  });

  const handleAutoDescription = async () => {
    if (!selectedImage) return;
    try {
      const desc = await generateSceneDescription(selectedImage, config.name, config.theme);
      setConfig(prev => ({ ...prev, description: desc }));
    } catch (err) {
      console.error("Auto description failed", err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setStatus(GenerationStatus.LOADING);
    setError(null);
    setGeneratedImages([]);
    setActiveImageIndex(0);

    try {
      // Generate 5 images
      const results = await generateProductGallery(
        selectedImage,
        config.name,
        config.theme,
        config.description,
        config.elements
      );
      
      setGeneratedImages(results);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(GenerationStatus.ERROR);
      setError(err.message || "Something went wrong. Please check your API key and try again.");
    }
  };

  const handleDownload = () => {
    const activeImage = generatedImages[activeImageIndex];
    if (activeImage) {
      const link = document.createElement('a');
      link.href = activeImage;
      link.download = `lumiere-${config.name.replace(/\s+/g, '-').toLowerCase()}-${activeImageIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCFD]">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-serif font-bold text-gray-900">
            {currentView === AppView.GENERATOR ? 'AI Product Studio' : 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">System Operational</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Designer&background=f43f5e&color=fff" alt="User" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {currentView === AppView.GENERATOR && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              
              {/* Left Column: Controls */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center">
                    <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                    Upload Asset
                  </h3>
                  <ImageUpload onImageSelect={setSelectedImage} selectedImage={selectedImage} />
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                   <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center">
                    <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                    Configuration
                  </h3>
                  <GeneratorPanel 
                    config={config} 
                    setConfig={setConfig} 
                    onGenerate={handleGenerate} 
                    onAutoDescription={handleAutoDescription}
                    status={status}
                    hasImage={!!selectedImage}
                  />
                </div>
              </div>

              {/* Right Column: Preview/Result Gallery */}
              <div className="lg:col-span-8 flex flex-col h-full min-h-[600px] space-y-4">
                
                {/* Main Hero Viewer */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 relative overflow-hidden flex items-center justify-center p-4">
                  
                  {/* Background Decoration */}
                  <div className="absolute inset-0 bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none"></div>

                  {status === GenerationStatus.IDLE && generatedImages.length === 0 && (
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SparklesIcon className="w-10 h-10 text-rose-300" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Ready to Create</h3>
                      <p className="text-gray-500">
                        Upload your product image, auto-generate a description, and create a full campaign gallery in seconds.
                      </p>
                    </div>
                  )}

                  {status === GenerationStatus.LOADING && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-20">
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-900 animate-pulse">Designing Campaign...</h3>
                      <p className="text-sm text-gray-500 mt-2">Generating 5 distinct variations</p>
                    </div>
                  )}

                  {status === GenerationStatus.ERROR && (
                    <div className="text-center max-w-md bg-red-50 p-8 rounded-3xl border border-red-100">
                       <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-red-800 mb-2">Generation Failed</h3>
                       <p className="text-red-600 text-sm">{error}</p>
                       <button onClick={() => setStatus(GenerationStatus.IDLE)} className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                         Try Again
                       </button>
                    </div>
                  )}

                  {generatedImages.length > 0 && status !== GenerationStatus.LOADING && (
                    <div className="relative w-full h-full flex items-center justify-center animate-fade-in group">
                       <img 
                        src={generatedImages[activeImageIndex]} 
                        alt="Generated Hero" 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
                      />
                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 bg-white/90 rounded-lg text-gray-700 hover:text-rose-600 shadow-sm">
                           <ArrowsPointingOutIcon className="w-5 h-5" />
                         </button>
                      </div>
                      <div className="absolute bottom-6 right-6 flex space-x-3">
                         <button 
                          onClick={handleDownload}
                          className="flex items-center px-6 py-3 bg-white text-gray-900 rounded-xl shadow-lg hover:shadow-xl font-medium transition-all hover:-translate-y-1"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {generatedImages.length > 0 && status !== GenerationStatus.LOADING && (
                  <div className="h-28 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 grid grid-cols-5 gap-2">
                    {generatedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          activeImageIndex === idx 
                            ? 'border-rose-500 ring-2 ring-rose-200 scale-105 shadow-md z-10' 
                            : 'border-transparent hover:border-rose-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />
                        {activeImageIndex === idx && (
                          <div className="absolute inset-0 bg-rose-500/10 mix-blend-multiply"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {currentView !== AppView.GENERATOR && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-3xl font-serif font-bold text-gray-300 mb-4">Coming Soon</h2>
              <p className="text-gray-400">This module is under development.</p>
              <button 
                onClick={() => setCurrentView(AppView.GENERATOR)}
                className="mt-6 px-6 py-2 bg-rose-50 text-rose-600 rounded-lg font-medium hover:bg-rose-100 transition-colors"
              >
                Go to Generator
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;