import React from 'react';
import { Upload, FileAudio, FileImage, FileText, X, Camera } from 'lucide-react';
import { FileType, UploadedFile } from '../types';

interface FileUploadProps {
  label: string;
  accept: string;
  fileType: FileType;
  onUpload: (file: UploadedFile) => void;
  currentFiles: UploadedFile[];
  onRemove: (id: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  accept, 
  fileType, 
  onUpload, 
  currentFiles,
  onRemove
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64Raw = event.target?.result as string;
        // Split metadata from base64 string
        const base64 = base64Raw.split(',')[1];
        
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileType,
          url: URL.createObjectURL(file),
          base64: base64,
          mimeType: file.type
        };
        onUpload(newFile);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const getIcon = () => {
    switch (fileType) {
      case 'audio': return <FileAudio className="w-6 h-6 text-sky-400" />;
      case 'image': return <FileImage className="w-6 h-6 text-cyan-400" />;
      case 'pdf': return <FileText className="w-6 h-6 text-blue-400" />;
    }
  };

  const filteredFiles = currentFiles.filter(f => f.type === fileType);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-sky-200 mb-2">{label}</label>
      
      <div className="space-y-3">
        {filteredFiles.map(file => (
          <div key={file.id} className="flex items-center justify-between bg-[#1e293b] p-3 rounded-lg border border-sky-800/30 group hover:border-sky-500/50 transition-colors">
            <div className="flex items-center space-x-3 overflow-hidden">
              {getIcon()}
              <span className="text-sm text-sky-100 truncate group-hover:text-white transition-colors">{file.name}</span>
            </div>
            <button 
              onClick={() => onRemove(file.id)}
              className="text-sky-500 hover:text-red-400 transition-colors p-2 min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}

        <div className="flex gap-2">
            {/* Default Upload Button */}
            <div className="relative group flex-1">
            <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center justify-center w-full min-h-[48px] border-2 border-dashed border-sky-900/40 rounded-lg group-hover:border-sky-400 group-hover:bg-sky-900/10 transition-all">
                <div className="flex items-center space-x-2 text-sky-400/60 group-hover:text-sky-400">
                <Upload className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Upload</span>
                </div>
            </div>
            </div>

            {/* Camera Button (Only for Image) */}
            {fileType === 'image' && (
                <div className="relative group w-1/3">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center w-full min-h-[48px] border-2 border-dashed border-sky-900/40 rounded-lg group-hover:border-cyan-400 group-hover:bg-cyan-900/10 transition-all bg-[#0f172a]">
                        <div className="flex items-center justify-center text-sky-400/60 group-hover:text-cyan-400">
                            <Camera className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};