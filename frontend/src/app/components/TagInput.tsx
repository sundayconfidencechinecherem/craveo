'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect, useRef } from 'react';
import { FaTimes, FaTag, FaPlus } from 'react-icons/fa';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
  error?: string;
}

export default function TagInput({
  tags,
  onTagsChange,
  placeholder = 'Add tags...',
  maxTags = 10,
  suggestions = ['Delicious', 'Homemade', 'Restaurant', 'Recipe', 'Healthy', 'Dessert', 'Spicy', 'Vegetarian', 'Vegan', 'QuickMeal'],
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions
        .filter(suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
        )
        .slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, tags, suggestions]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-primary mb-2">
        Tags
        <span className="text-text-tertiary text-xs ml-2">
          (Max {maxTags} tags)
        </span>
      </label>
      
      <div className="relative">
        <div className={`
          flex flex-wrap gap-2 p-3 bg-surface border rounded-lg
          ${error ? 'border-error' : 'border-border'}
          focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent
          transition-all duration-200
        `}>
          {/* Existing Tags */}
          {tags.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
            >
              <FaTag className="w-3 h-3" />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-primary-dark"
                title="Remove tag"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Input for new tags */}
          {tags.length < maxTags && (
            <div className="relative flex-1 min-w-[120px]">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder={tags.length === 0 ? placeholder : ''}
                className="w-full bg-transparent outline-none text-text-primary placeholder-text-tertiary"
              />
              
              {/* Add button */}
              {inputValue.trim() && (
                <button
                  type="button"
                  onClick={() => addTag(inputValue)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark"
                  title="Add tag"
                >
                  <FaPlus />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="py-1">
              <div className="px-3 py-2 text-xs text-text-tertiary border-b border-border">
                Suggestions
              </div>
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-hover text-text-primary flex items-center gap-2"
                >
                  <FaTag className="w-3 h-3 text-text-tertiary" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Helper text */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <div className="text-text-tertiary">
          Press Enter or comma to add tags
        </div>
        <div className={`font-medium ${tags.length >= maxTags ? 'text-error' : 'text-text-tertiary'}`}>
          {tags.length}/{maxTags} tags
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
