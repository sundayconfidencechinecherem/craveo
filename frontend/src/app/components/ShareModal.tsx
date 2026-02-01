// src/app/components/ShareModal.tsx - FIXED
'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { FaTimes, FaCopy, FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaShare } from 'react-icons/fa';
import Button from './Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  postImage?: string;
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  postId, 
  postTitle = 'Check out this post!',
  postImage 
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Initialize on client side only
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/post/${postId}`);
    }
  }, [postId]);

  if (!isOpen) return null;

  const encodedTitle = encodeURIComponent(postTitle);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: <FaCopy />,
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
      action: async () => {
        if (isClient) {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    },
    {
      name: 'Facebook',
      icon: <FaFacebook className="text-blue-600" />,
      color: 'bg-blue-50 hover:bg-blue-100',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Twitter',
      icon: <FaTwitter className="text-blue-400" />,
      color: 'bg-blue-50 hover:bg-blue-100',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="text-green-500" />,
      color: 'bg-green-50 hover:bg-green-100',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    }
  ];

  const handleShare = (option: any) => {
    if (!isClient) return;
    
    if (option.action) {
      option.action();
    } else if (option.url) {
      window.open(option.url, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (!isClient) return;
    
    try {
      // Check if Web Share API is supported AND available
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({
          title: postTitle,
          text: customMessage || 'Thought you might like this',
          url: shareUrl,
        });
        onClose();
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log('Native sharing cancelled or not available:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Share Post</h2>
            <p className="text-text-secondary text-sm mt-1">Share this post with others</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Message */}
        <div className="p-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Add a message (optional)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add your message..."
            className="w-full px-4 py-3 bg-surface-hover border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-text-tertiary mt-1 text-right">
            {customMessage.length}/200
          </p>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3 p-6 border-t border-border">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleShare(option)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-105 ${option.color}`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <span className="font-medium text-text-primary">{option.name}</span>
              {option.name === 'Copy Link' && copied && (
                <span className="text-xs text-green-600 mt-1">Copied!</span>
              )}
            </button>
          ))}
        </div>

        {/* Native Share Button (for mobile) */}
        {/* This will only show if Web Share API is supported */}
        {isClient && (navigator.share && typeof navigator.share === 'function') ? (
          <div className="p-6 border-t border-border">
            <Button
              onClick={handleNativeShare}
              fullWidth
              icon={<FaShare />}
              className="bg-gradient-to-r from-primary to-primary-light text-white hover:opacity-90"
            >
              Share via Device
            </Button>
          </div>
        ) : null}

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface-hover">
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Share URL: <span className="font-mono text-xs bg-surface px-2 py-1 rounded">
                {shareUrl.length > 40 ? `${shareUrl.substring(0, 40)}...` : shareUrl}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}