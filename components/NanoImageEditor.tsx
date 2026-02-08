import React, { useState } from 'react';
import { UploadedFile } from '../types';
import { editImageWithNano } from '../services/geminiService';
import { Wand2, Loader2, Download } from 'lucide-react';

interface NanoImageEditorProps {
  images: UploadedFile[];
}

export const NanoImageEditor: React.FC<NanoImageEditorProps> = ({ images }) => {
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleEdit = async () => {
    const selectedImg = images.find(img => img.id === selectedImageId);
    if (!selectedImg || !prompt) return;

    setIsProcessing(true);
    setResultImage(null);
    try {
      const newImage = await editImageWithNano(selectedImg.base64, selectedImg.mimeType, prompt);
      setResultImage(newImage);
    } catch (e) {
      console.error(e);
      alert("Failed to edit image. Ensure you are using a valid API Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedImage = images.find(img => img.id === selectedImageId);

  if (images.length === 0) return (
    <div className="text-center text-sky-300/60 p-4 bg-[#1e293b] rounded-lg border border-dashed border-sky-800/40">
      Upload images to use the Nano Editor.
    </div>
  );

  return (
    <div className="bg-[#1e293b] rounded-xl p-4 border border-sky-800/30 shadow-lg">
      <div className="flex items-center space-x-2 mb-4 text-sky-400">
        <Wand2 className="w-5 h-5" />
        <h3 className="font-semibold text-sky-100">Nano Image Editor</h3>
      </div>

      <div className="space-y-4">
        {/* Image Selection */}
        <div>
          <label className="block text-xs uppercase text-sky-400/80 font-semibold mb-2">Select Source Image</label>
          <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
            {images.map(img => (
              <button
                key={img.id}
                onClick={() => { setSelectedImageId(img.id); setResultImage(null); }}
                className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${selectedImageId === img.id ? 'border-sky-500 opacity-100 ring-2 ring-sky-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        {selectedImageId && (
          <div className="animate-in fade-in slide-in-from-top-2">
             <div className="relative rounded-lg overflow-hidden border border-sky-800/40 aspect-video mb-3 bg-[#020617] flex items-center justify-center group">
                {resultImage ? (
                    <img src={resultImage} alt="Edited" className="w-full h-full object-contain" />
                ) : (
                    <img src={selectedImage?.url} alt="Original" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                    </div>
                )}
             </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='E.g., "Add a retro filter", "Highlight the text"'
                className="flex-1 bg-[#020617] border border-sky-800/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-sky-500/50 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <button
                onClick={handleEdit}
                disabled={isProcessing || !prompt}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </button>
            </div>
            
            {resultImage && (
                 <a href={resultImage} download="edited_image.png" className="block mt-2 text-center text-xs text-sky-400 hover:text-sky-300">
                    <Download className="w-3 h-3 inline mr-1"/> Download Edited Image
                 </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};