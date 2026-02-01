// src/app/profile/edit/page.tsx - COMPLETE CORRECTED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useUpdateProfile } from '@/app/hooks/useGraphQL';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { FaArrowLeft, FaSave, FaCamera } from 'react-icons/fa';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { updateProfile, loading: updateLoading, error: updateError } = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    website: '',
    location: '',
    avatar: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user?.fullName || '',
        username: user?.username || '',
        bio: user?.bio || '',
        website: user?.website || '',
        location: user?.location || '',
        avatar: user?.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
      
      // Note: In a real app, you would upload to your server/cloud storage here
      // For now, we'll use the data URL
    } catch (error) {
      console.error('Failed to process avatar:', error);
      setUploadingAvatar(false);
      alert('Failed to process image. Please try another.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check if any changes were made
      const hasChanges = 
        formData.fullName !== user?.fullName ||
        formData.username !== user?.username ||
        formData.bio !== user?.bio ||
        formData.website !== user?.website ||
        formData.location !== user?.location ||
        formData.avatar !== user?.avatar;

      if (!hasChanges) {
        alert('No changes detected');
        router.push('/profile');
        return;
      }

      // Prepare update data
      const updateData: any = {};
      
      if (formData.fullName !== user?.fullName) updateData.fullName = formData.fullName;
      if (formData.username !== user?.username) updateData.username = formData.username;
      if (formData.bio !== user?.bio) updateData.bio = formData.bio;
      if (formData.website !== user?.website) updateData.website = formData.website;
      if (formData.location !== user?.location) updateData.location = formData.location;
      if (formData.avatar !== user?.avatar) updateData.avatar = formData.avatar;

      // Call the updateProfile function with the data
      const result = await updateProfile(updateData);
      
      if (result?.data?.updateProfile?.success) {
        router.push('/profile');
      } else {
        throw new Error(result?.data?.updateProfile?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
          <div className="container mx-auto px-4 max-w-2xl py-8">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
        <div className="container mx-auto px-4 max-w-2xl py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
              type="button"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">Edit Profile</h1>
          </div>

          {/* Error Message */}
          {updateError && (
            <div className="mb-6 bg-error/10 border border-error/20 rounded-xl p-4">
              <p className="text-error text-sm">{updateError.message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-lg p-6 space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  {uploadingAvatar ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    <img
                      src={formData.avatar || '/images/avatars/default.png'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer">
                  <FaCamera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <p className="text-sm text-text-secondary text-center">
                {uploadingAvatar ? 'Uploading...' : 'Click the camera icon to change your avatar'}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Username can only contain letters, numbers and underscores"
                  minLength={3}
                  maxLength={30}
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Letters, numbers and underscores only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={160}
                  placeholder="Tell us about yourself..."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-text-tertiary">
                    {formData.bio.length}/160 characters
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Optional
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com"
                  pattern="https?://.+"
                  title="Please enter a valid URL starting with http:// or https://"
                />
                <p className="text-xs text-text-tertiary mt-1">Optional</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="City, Country"
                  maxLength={100}
                />
                <p className="text-xs text-text-tertiary mt-1">Optional</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-surface-hover text-text-primary rounded-lg hover:bg-surface-hover-dark transition-colors"
                disabled={isSubmitting || updateLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || updateLoading || uploadingAvatar}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave /> 
                {isSubmitting || updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Success/Error Toast (optional) */}
          {updateError && (
            <div className="fixed bottom-4 right-4 bg-error text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
              {updateError.message}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}