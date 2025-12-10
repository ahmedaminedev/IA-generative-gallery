import React, { useCallback, useState } from 'react';
import { CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  selectedImage: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, selectedImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="block text-sm font-medium text-gray-700 mb-2">Product Image</div>
      
      {!selectedImage ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 h-64 cursor-pointer group ${
            isDragging
              ? 'border-rose-500 bg-rose-50 scale-[1.02]'
              : 'border-gray-200 hover:border-rose-300 hover:bg-gray-50'
          }`}
        >
          <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-50'}`}>
            <CloudArrowUpIcon className={`w-8 h-8 ${isDragging ? 'text-rose-600' : 'text-gray-400 group-hover:text-rose-500'}`} />
          </div>
          <p className="text-sm font-medium text-gray-900">
            <span className="text-rose-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50">
             <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
          </div>
          <button 
            onClick={(e) => {
                e.preventDefault();
                onImageSelect(''); 
            }}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-700 hover:text-red-500 p-2 rounded-lg shadow-sm border border-gray-100 text-xs font-medium transition-all opacity-0 group-hover:opacity-100"
          >
            Change Image
          </button>
        </div>
      )}
    </div>
  );
};