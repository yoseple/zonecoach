import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';

interface Props {
  onPhotoSelected: (dataUrl: string) => void;
  onClear: () => void;
  currentPhoto: string | null;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const PhotoInput: React.FC<Props> = ({ onPhotoSelected, onClear, currentPhoto }) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // First, get a stable data URL
      const dataUrl = await fileToDataUrl(file);
      
      // Then compress it for performance (still returns a data URL)
      // If html-to-image is very sensitive, we could skip compression, 
      // but usually it helps by reducing the DOM payload.
      const compressed = await compressImage(file);
      onPhotoSelected(compressed || dataUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Failed to process image. Please try another one.');
    } finally {
      setIsProcessing(false);
      // Reset input values so the same file can be selected again
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!currentPhoto ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => galleryInputRef.current?.click()}
            disabled={isProcessing}
            className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <ImageIcon size={32} className="text-slate-400 group-hover:text-blue-500 mb-3" />
            <span className="text-sm font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-700">Upload from Gallery</span>
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="flex flex-col items-center justify-center p-8 bg-slate-900 border-2 border-transparent rounded-[2rem] hover:bg-blue-600 transition-all group shadow-xl shadow-slate-200"
          >
            <Camera size={32} className="text-slate-400 group-hover:text-white mb-3" />
            <span className="text-sm font-black uppercase tracking-widest text-white">Take Photo</span>
          </button>
        </div>
      ) : (
        <div className="relative group rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl aspect-square sm:aspect-video bg-slate-100">
          <img src={currentPhoto} alt="Run preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
             <button 
               onClick={() => galleryInputRef.current?.click()}
               className="p-4 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform"
             >
                <ImageIcon size={24} />
             </button>
             <button 
               onClick={onClear}
               className="p-4 bg-rose-500 rounded-full text-white hover:scale-110 transition-transform"
             >
                <X size={24} />
             </button>
          </div>
        </div>
      )}

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={galleryInputRef} 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <div className="flex items-start space-x-2 text-slate-400 bg-slate-50 p-4 rounded-2xl">
         <AlertCircle size={16} className="shrink-0 mt-0.5" />
         <p className="text-[10px] font-bold leading-relaxed">
            Camera capture support depends on your mobile browser. If the camera does not open, use Upload Photo instead. Images are compressed for performance.
         </p>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-70 flex flex-col items-center justify-center">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-sm font-black uppercase tracking-widest text-blue-900">Optimizing Image...</p>
        </div>
      )}
    </div>
  );
};
