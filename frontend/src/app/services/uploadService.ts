import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface UploadResponse {
  success: boolean;
  url?: string;
  urls?: string[];
  error?: string;
}

/**
 * Compress image client-side before upload
 */
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
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image'));
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

/**
 * Upload a single image
 */
export const uploadImage = async (file: File, token: string): Promise<string> => {
  try {
    let fileToUpload = file;

    // Compress if larger than 5MB
    if (file.size > 5 * 1024 * 1024) {
      const compressedBlob = await compressImage(file);
      fileToUpload = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    }

    const formData = new FormData();
    formData.append('image', fileToUpload);

    const response = await axios.post(`${API_URL}/api/upload/single`, formData, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000,
    });

    if (response.data.success) {
      return response.data.url;
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (files: File[], token: string): Promise<string[]> => {
  try {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.size > 3 * 1024 * 1024) {
          const compressedBlob = await compressImage(file, 1200, 0.6);
          return new File([compressedBlob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
        }
        return file;
      })
    );

    const formData = new FormData();
    processedFiles.forEach((file) => formData.append('images', file));

    const response = await axios.post(`${API_URL}/api/upload/multiple`, formData, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 60000,
    });

    if (response.data.success) {
      return response.data.urls;
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload images');
  }
};

/**
 * Fallback: upload sequentially if batch fails
 */
export const uploadImagesSequentially = async (files: File[], token: string): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadImage(file, token);
    urls.push(url);
  }
  return urls;
};
