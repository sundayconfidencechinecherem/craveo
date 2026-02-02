// src/app/create-post/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaCamera, 
  FaUtensils, 
  FaClock, 
  FaMapMarkerAlt, 
  FaCheck, 
  FaHome, 
  FaUsers,
  FaUpload,
  FaTrash,
  FaTag,
  FaGlobe,
  FaUserFriends,
  FaLock,
  FaImage,
  FaBook,
  FaPen,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useCreatePost } from '@/app/hooks/useGraphQL';
import { PostType, PostPrivacy } from '@/app/graphql/types';
import { useAuth } from '@/app/context/AuthContext';

export default function CreatePostPage() {
  const router = useRouter();
  const { createPost, loading: createPostLoading, error: createPostError } = useCreatePost();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Form states - REQUIRED FIELDS
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // Form states - OPTIONAL FIELDS
  const [postType, setPostType] = useState<PostType>(PostType.NORMAL);
  const [privacy, setPrivacy] = useState<PostPrivacy>(PostPrivacy.PUBLIC);
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  // Recipe-specific fields (only shown if postType is RECIPE)
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>(['']);
  const [recipeInstructions, setRecipeInstructions] = useState<string[]>(['']);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  // UI states
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [postSuccess, setPostSuccess] = useState(false);
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle image upload (simplified - you'll need to implement actual upload)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 10) {
      setFormError('Maximum 10 images allowed');
      return;
    }
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreviews(prev => [...prev, result]);
        setImages(prev => [...prev, result]); // In real app, upload to server and get URL
      };
      reader.readAsDataURL(file);
    });
    
    if (formError) setFormError('');
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Tag handling
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Recipe fields handling
  const addIngredient = () => {
    setRecipeIngredients([...recipeIngredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...recipeIngredients];
    newIngredients[index] = value;
    setRecipeIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (recipeIngredients.length > 1) {
      setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => {
    setRecipeInstructions([...recipeInstructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...recipeInstructions];
    newInstructions[index] = value;
    setRecipeInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (recipeInstructions.length > 1) {
      setRecipeInstructions(recipeInstructions.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    //console.log('Form submission started...');
    
    // Validate required fields
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setFormError('Description is required');
      return;
    }
    
    if (images.length === 0) {
      setFormError('At least one image is required');
      return;
    }
    
    // Validate recipe details for recipe posts
    if (postType === PostType.RECIPE) {
      const validIngredients = recipeIngredients.filter(ing => ing.trim());
      const validInstructions = recipeInstructions.filter(inst => inst.trim());
      
      if (validIngredients.length === 0) {
        setFormError('At least one ingredient is required for recipe posts');
        return;
      }
      
      if (validInstructions.length === 0) {
        setFormError('At least one instruction is required for recipe posts');
        return;
      }
    }
    
    try {
      // Prepare recipeDetails if it's a recipe post
      const recipeDetails = postType === PostType.RECIPE ? {
        ingredients: recipeIngredients.filter(ing => ing.trim()),
        instructions: recipeInstructions.filter(inst => inst.trim()),
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        difficulty
      } : undefined;

      // Create post data - CORRECT VARIABLES STRUCTURE
      const postData = {
        title: title.trim(),
        content: content.trim(),
        images: images,
        postType,
        privacy,
        tags: tags.filter(tag => tag.trim()),
        location: location.trim() || undefined,
        restaurant: restaurant.trim() || undefined,
        recipeDetails
      };

      //console.log('Submitting post data:', postData);

      // Call GraphQL mutation
      const result = await createPost(postData);
      
      //console.log('Create post mutation result:', result);

      // Check if mutation was successful
      if (result.data?.createPost?.success) {
       // console.log('Post created successfully:', result.data.createPost);
        setPostSuccess(true);
        
        // Show success options after a delay
        setTimeout(() => {
          setShowSuccessOptions(true);
        }, 1000);
      } else {
        const errorMessage = result.data?.createPost?.message || 'Unknown error';
        //console.error('Post creation failed:', errorMessage);
        setFormError(`Failed to create post: ${errorMessage}`);
      }
    } catch (err: any) {
     // console.error('Error creating post:', err);
      setFormError('Failed to create post: ' + (err.message || 'Please try again'));
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleCreateAnother = () => {
    // Reset form
    setTitle('');
    setContent('');
    setImages([]);
    setImagePreviews([]);
    setPostType(PostType.NORMAL);
    setPrivacy(PostPrivacy.PUBLIC);
    setTags([]);
    setLocation('');
    setRestaurant('');
    setTagInput('');
    setRecipeIngredients(['']);
    setRecipeInstructions(['']);
    setPrepTime('');
    setCookTime('');
    setServings('');
    setDifficulty('medium');
    setPostSuccess(false);
    setShowSuccessOptions(false);
    setFormError('');
  };

  // If post was successful, show success screen
  if (postSuccess) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
          {/* Fixed Header for ALL screen sizes */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border p-4 flex items-center justify-between lg:hidden">
            <button
              onClick={handleGoHome}
              className="p-2 hover:bg-surface-hover rounded-full"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-text-primary">Post Created</h1>
            <div className="w-10"></div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block fixed top-0 left-64 right-0 z-50 bg-white border-b border-border p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center text-text-secondary hover:text-text-primary"
              >
                <FaArrowLeft className="mr-2" />
                Back to Home
              </button>
              <h1 className="text-xl font-bold text-text-primary">Post Created Successfully!</h1>
              <div className="w-24"></div>
            </div>
          </div>

          {/* Content with proper navbar spacing */}
          <div className="pt-16 lg:pt-20 lg:ml-64">
            <div className="max-w-2xl mx-auto px-4 py-8">
              {/* Success Animation/Message */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="text-green-600 text-4xl" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Post Created Successfully!</h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Your {postType.toLowerCase()} post is now live on Craveo.
                </p>
              </div>

              {/* Post Details Preview */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Post Details:</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-900 text-sm">Title:</span>
                    <p className="text-gray-600 text-sm mt-1">{title}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 text-sm">Type:</span>
                    <p className="text-gray-600 text-sm mt-1">{postType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 text-sm">Privacy:</span>
                    <p className="text-gray-600 text-sm mt-1">{privacy}</p>
                  </div>
                  {tags.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-900 text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Success Options */}
              {showSuccessOptions && (
                <div className="space-y-3">
                  <button
                    onClick={handleGoHome}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 text-sm md:text-base"
                  >
                    <FaHome className="w-4 h-4 md:w-5 md:h-5" />
                    Go to Home Feed
                  </button>
                  
                  <button
                    onClick={handleCreateAnother}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 text-sm md:text-base"
                  >
                    <FaCamera className="w-4 h-4 md:w-5 md:h-5" />
                    Create Another Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Original form
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-app-bg">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border p-4 flex items-center justify-between lg:hidden">
          <Link href="/" className="p-2 hover:bg-surface-hover rounded-full">
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-text-primary">Create Post</h1>
          <div className="w-10"></div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block fixed top-0 left-64 right-0 z-50 bg-white border-b border-border p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center text-text-secondary hover:text-text-primary"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold text-text-primary">Create New Post</h1>
            <div className="w-24"></div>
          </div>
        </div>

        {/* Content with proper navbar spacing */}
        <div className="pt-16 lg:pt-20 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
            {/* Form Container */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Error Display */}
                {(formError || createPostError) && (
                  <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                    <p className="text-error text-sm">
                      {formError || createPostError?.message}
                    </p>
                  </div>
                )}
                
                {/* Post Type Selection */}
                <div>
                  <label className="block text-lg font-semibold text-text-primary mb-3 md:mb-4">
                    Post Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPostType(PostType.NORMAL)}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        postType === PostType.NORMAL
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <FaImage className={`text-2xl mb-2 ${
                        postType === PostType.NORMAL ? 'text-primary' : 'text-text-secondary'
                      }`} />
                      <span className={`font-medium ${
                        postType === PostType.NORMAL ? 'text-primary' : 'text-text-primary'
                      }`}>
                        Normal Post
                      </span>
                      <p className="text-xs text-text-secondary mt-1">Share food photos & experiences</p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPostType(PostType.RECIPE)}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        postType === PostType.RECIPE
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <FaBook className={`text-2xl mb-2 ${
                        postType === PostType.RECIPE ? 'text-primary' : 'text-text-secondary'
                      }`} />
                      <span className={`font-medium ${
                        postType === PostType.RECIPE ? 'text-primary' : 'text-text-primary'
                      }`}>
                        Recipe Post
                      </span>
                      <p className="text-xs text-text-secondary mt-1">Share detailed recipes</p>
                    </button>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-lg font-semibold text-text-primary mb-3 md:mb-4">
                    Privacy
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setPrivacy(PostPrivacy.PUBLIC)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center ${
                        privacy === PostPrivacy.PUBLIC
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 text-text-primary'
                      }`}
                    >
                      <FaGlobe className="text-lg mb-1" />
                      <span className="text-sm font-medium">Public</span>
                      <span className="text-xs opacity-75">Everyone</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPrivacy(PostPrivacy.FRIENDS)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center ${
                        privacy === PostPrivacy.FRIENDS
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 text-text-primary'
                      }`}
                    >
                      <FaUserFriends className="text-lg mb-1" />
                      <span className="text-sm font-medium">Friends</span>
                      <span className="text-xs opacity-75">Followers only</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPrivacy(PostPrivacy.PRIVATE)}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center ${
                        privacy === PostPrivacy.PRIVATE
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 text-text-primary'
                      }`}
                    >
                      <FaLock className="text-lg mb-1" />
                      <span className="text-sm font-medium">Private</span>
                      <span className="text-xs opacity-75">Only me</span>
                    </button>
                  </div>
                </div>

                {/* Title (Required) */}
                <div>
                  <label className="block text-lg font-semibold text-text-primary mb-3 md:mb-4">
                    <div className="flex items-center gap-2">
                      <FaPen className="text-primary" />
                      Title *
                    </div>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a catchy title..."
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                    required
                    maxLength={200}
                  />
                  <div className="flex justify-end mt-2">
                    <p className={`text-xs md:text-sm ${title.length > 180 ? 'text-error' : 'text-text-tertiary'}`}>
                      {title.length}/200
                    </p>
                  </div>
                </div>

                {/* Content/Description (Required) */}
                <div>
                  <label className="block text-lg font-semibold text-text-primary mb-3 md:mb-4">
                    <div className="flex items-center gap-2">
                      <FaPen className="text-primary" />
                      Description *
                    </div>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your food story, dining experience, or recipe introduction..."
                    rows={4}
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm md:text-base"
                    required
                    maxLength={5000}
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-text-secondary text-xs md:text-sm">
                      Required field
                    </p>
                    <p className={`text-xs md:text-sm ${content.length > 4800 ? 'text-error' : 'text-text-tertiary'}`}>
                      {content.length}/5000
                    </p>
                  </div>
                </div>

                {/* Images (Required) */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-text-primary mb-3 md:mb-4">
                    <FaCamera className="text-primary" />
                    Photos *
                  </label>
                  
                  {imagePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-xl p-8 md:p-12 text-center hover:border-primary transition-colors bg-surface-hover">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                            <FaCamera className="text-primary text-xl md:text-2xl" />
                          </div>
                          <p className="text-text-primary font-medium text-sm md:text-base">
                            Click to upload food photos
                          </p>
                          <p className="text-text-secondary text-xs md:text-sm mt-1">
                            At least one photo is required
                          </p>
                        </div>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                  
                  {imagePreviews.length > 0 && (
                    <label htmlFor="add-more-images" className="inline-block mt-4">
                      <div className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 cursor-pointer inline-flex items-center gap-2">
                        <FaPlus className="w-3 h-3" />
                        Add More Photos
                      </div>
                      <input
                        id="add-more-images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Recipe Details (Only for RECIPE type) */}
                {postType === PostType.RECIPE && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                      Recipe Details
                    </h3>
                    
                    {/* Ingredients */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Ingredients *
                      </label>
                      <div className="space-y-2">
                        {recipeIngredients.map((ingredient, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={ingredient}
                              onChange={(e) => updateIngredient(index, e.target.value)}
                              placeholder={`Ingredient ${index + 1}`}
                              className="flex-1 px-3 py-2 bg-surface-hover border border-border rounded-lg text-sm"
                            />
                            {recipeIngredients.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeIngredient(index)}
                                className="px-3 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="mt-2 text-primary hover:text-primary-dark text-sm inline-flex items-center gap-1"
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Ingredient
                      </button>
                    </div>
                    
                    {/* Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Instructions *
                      </label>
                      <div className="space-y-2">
                        {recipeInstructions.map((instruction, index) => (
                          <div key={index} className="flex gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={instruction}
                              onChange={(e) => updateInstruction(index, e.target.value)}
                              placeholder={`Step ${index + 1}`}
                              className="flex-1 px-3 py-2 bg-surface-hover border border-border rounded-lg text-sm"
                            />
                            {recipeInstructions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeInstruction(index)}
                                className="px-3 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addInstruction}
                        className="mt-2 text-primary hover:text-primary-dark text-sm inline-flex items-center gap-1"
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Step
                      </button>
                    </div>
                    
                    {/* Recipe Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                          <FaClock className="w-3 h-3" />
                          Prep Time (mins)
                        </label>
                        <input
                          type="number"
                          value={prepTime}
                          onChange={(e) => setPrepTime(e.target.value)}
                          placeholder="e.g., 15"
                          className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                          <FaClock className="w-3 h-3" />
                          Cook Time (mins)
                        </label>
                        <input
                          type="number"
                          value={cookTime}
                          onChange={(e) => setCookTime(e.target.value)}
                          placeholder="e.g., 30"
                          className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                          <FaUsers className="w-3 h-3" />
                          Servings
                        </label>
                        <input
                          type="number"
                          value={servings}
                          onChange={(e) => setServings(e.target.value)}
                          placeholder="e.g., 4"
                          className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Difficulty
                        </label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                          className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-sm"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label className="block text-lg font-semibold text-text-primary mb-3 md:mb-4">
                    <div className="flex items-center gap-2">
                      <FaTag className="text-primary" />
                      Tags
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-2 text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-primary hover:text-primary-dark"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add a tag and press Enter (tags will be converted to lowercase)"
                    className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                  />
                </div>

                {/* Location & Restaurant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Lagos, Nigeria"
                      className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                      <FaUtensils className="w-3 h-3" />
                      Restaurant (optional)
                    </label>
                    <input
                      type="text"
                      value={restaurant}
                      onChange={(e) => setRestaurant(e.target.value)}
                      placeholder="Restaurant name"
                      className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 md:pt-8 border-t border-border">
                  <button
                    type="submit"
                    disabled={createPostLoading || !title.trim() || !content.trim() || images.length === 0}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    {createPostLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                        Creating Post...
                      </>
                    ) : (
                      <>
                        <FaUpload className="w-4 h-4 md:w-5 md:h-5" />
                        {postType === PostType.RECIPE ? 'Share Recipe' : 'Share Post'}
                      </>
                    )}
                  </button>
                  <p className="text-text-secondary text-xs text-center mt-2">
                    * Required fields
                  </p>
                </div>
              </form>
            </div>

            {/* Tips */}
            <div className="mt-6 md:mt-8 bg-surface border border-border rounded-lg p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-text-primary mb-3 md:mb-4">
                Tips for a great post:
              </h3>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start text-sm md:text-base">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-text-secondary">Use good lighting for clear food photos</span>
                </li>
                <li className="flex items-start text-sm md:text-base">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-text-secondary">Be descriptive in your title and content</span>
                </li>
                <li className="flex items-start text-sm md:text-base">
                  <span className="text-primary mr-2">•</span>
                  <span className="text-text-secondary">Add relevant tags to help others discover your post</span>
                </li>
                {postType === PostType.RECIPE && (
                  <>
                    <li className="flex items-start text-sm md:text-base">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-text-secondary">List ingredients in the order they're used</span>
                    </li>
                    <li className="flex items-start text-sm md:text-base">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-text-secondary">Include step-by-step instructions</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}