// src/app/services/uploadService.ts - UPDATED WITH RETRY LOGIC
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface UploadResponse {
  success: boolean;
  url?: string;
  urls?: string[];
  error?: string;
}

// Helper to compress images client-side before upload
export const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export const uploadImage = async (file: File, token: string): Promise<string> => {
  try {
    console.log('Uploading image:', file.name, 'size:', file.size, 'type:', file.type);
    
    // Compress image if it's too large
    let fileToUpload = file;
    if (file.size > 5 * 1024 * 1024) { // If larger than 5MB
      console.log('Compressing large image...');
      const compressedBlob = await compressImage(file);
      fileToUpload = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      console.log('Compressed size:', compressedBlob.size);
    }
    
    const formData = new FormData();
    formData.append('image', fileToUpload);

    const response = await axios.post(`${API_URL}/api/upload/single`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000, // 30 seconds
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    });

    if (response.data.success) {
      console.log('✅ Image uploaded successfully:', response.data.url);
      return response.data.url;
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
  } catch (error: any) {
    console.error('❌ Image upload error:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. Please try again with a smaller file.');
    } else if (error.response?.status === 413) {
      throw new Error('File is too large. Maximum size is 10MB.');
    } else if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to upload image. Please check your connection.');
    }
  }
};

export const uploadMultipleImages = async (files: File[], token: string): Promise<string[]> => {
  try {
    console.log(`📤 Starting upload of ${files.length} images...`);
    
    // Compress large images
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.size > 3 * 1024 * 1024) { // Compress if > 3MB
          console.log(`Compressing ${file.name}...`);
          const compressedBlob = await compressImage(file, 1200, 0.6);
          return new File([compressedBlob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
        }
        return file;
      })
    );
    
    const formData = new FormData();
    processedFiles.forEach(file => {
      formData.append('images', file);
    });

    const response = await axios.post(`${API_URL}/api/upload/multiple`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 60000, // 60 seconds for multiple files
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📊 Batch upload progress: ${percentCompleted}%`);
        }
      }
    });

    if (response.data.success) {
      console.log('✅ All images uploaded successfully:', response.data.urls);
      return response.data.urls;
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
  } catch (error: any) {
    console.error('❌ Multiple images upload error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. Please try with fewer or smaller images.');
    } else if (error.response?.status === 413) {
      throw new Error('Total file size is too large. Maximum total size is 20MB.');
    } else if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to upload images. Please check your connection.');
    }
  }
};

// Fallback upload method (uploads one by one if batch fails)
export const uploadImagesSequentially = async (files: File[], token: string): Promise<string[]> => {
  console.log('🔄 Uploading images sequentially...');
  const urls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      console.log(`Uploading image ${i + 1} of ${files.length}...`);
      const url = await uploadImage(files[i], token);
      urls.push(url);
    } catch (error: any) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
    }
  }
  
  console.log('✅ All images uploaded sequentially');
  return urls;
};