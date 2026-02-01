'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';

interface ImageUploadProps {
  onImageChange: (file: File | null, previewUrl: string) => void;
  initialPreview?: string;
  error?: string;
  maxSizeMB?: number;
  accept?: string;
}

export default function ImageUpload({
  onImageChange,
  initialPreview = '',
  error,
  maxSizeMB = 5,
  accept = 'image/*',
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(initialPreview);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Reset errors
    setUploadError('');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }
    
    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      onImageChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setUploadError('');
    onImageChange(null, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayError = error || uploadError;

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {previewUrl ? (
        <div className="relative">
          <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
          </div>
          
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-3 right-3 w-10 h-10 bg-error text-white rounded-full flex items-center justify-center hover:bg-error-dark transition-colors shadow-lg"
            title="Remove image"
          >
            <FaTimes />
          </button>
          
          <div className="mt-3 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-primary hover:text-primary-dark hover:underline"
            >
              Change image
            </button>
            <span className="text-text-tertiary">
              Click to replace or drag new image
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 hover:border-primary hover:bg-primary/5
            ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}
            ${displayError ? 'border-error' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {isDragging ? (
                <FaCloudUploadAlt className="w-8 h-8 text-primary" />
              ) : (
                <FaImage className="w-8 h-8 text-primary" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {isDragging ? 'Drop image here' : 'Upload your food photo'}
            </h3>
            
            <p className="text-text-secondary mb-4">
              Drag & drop or click to browse
            </p>
            
            <div className="text-xs text-text-tertiary space-y-1">
              <p>Supports: JPG, PNG, WebP</p>
              <p>Max size: {maxSizeMB}MB</p>
            </div>
          </div>
        </div>
      )}
      
      {displayError && (
        <p className="mt-2 text-sm text-error">{displayError}</p>
      )}
    </div>
  );
}
