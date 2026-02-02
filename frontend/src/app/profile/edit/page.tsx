'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCurrentUser, useUpdateProfile } from '@/app/hooks/useGraphQL';
import { uploadImage } from '@/app/services/uploadService';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { getOptimizedImageProps } from '@/app/utils/imageUtils';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { updateProfile, loading: updateLoading, error } = useUpdateProfile();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    dateOfBirth: '',
    avatar: '',
    coverPhoto: '',
  });

  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync form state when user data arrives
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        dateOfBirth: user.dateOfBirth || '',
        avatar: user.avatar || '',
        coverPhoto: user.coverPhoto || '',
      });
    }
  }, [user]);

  if (userLoading) return <LoadingSpinner size="lg" />;
  if (!user) return <div>No user found</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'avatar' | 'coverPhoto'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const token = localStorage.getItem('token') || '';
      const url = await uploadImage(file, token);
      setForm({ ...form, [field]: url });
    } catch (err: any) {
      setUploadError(`Image upload failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...form,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
      });
      router.push('/profile');
    } catch (err: any) {
      setUploadError(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg pt-16 lg:pt-0">
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="text-2xl font-bold mb-6 text-text-primary">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-lg p-6">
          {/* Cover Photo */}
          <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden">
            {form.coverPhoto && (
              <Image
                {...getOptimizedImageProps({
                  src: form.coverPhoto,
                  alt: 'Cover Photo',
                  width: 800,
                  height: 160,
                  className: 'object-cover w-full h-full',
                })}
              />
            )}
            <label className="absolute bottom-2 right-2 bg-primary text-white px-3 py-1 rounded cursor-pointer">
              Change Cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'coverPhoto')}
              />
            </label>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Image
              {...getOptimizedImageProps({
                src: form.avatar 
                  ? form.avatar 
                  : `https://ui-avatars.com/api/?name=${form.fullName}&background=random&format=png`,
                alt: 'Avatar',
                width: 80,
                height: 80,
                className: 'rounded-full border',
              })}
            />

            <label className="bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
              Change Avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'avatar')}
              />
            </label>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateLoading}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Error Messages */}
          {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
          {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
        </form>
      </div>
    </div>
  );
}
