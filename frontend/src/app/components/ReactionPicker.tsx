'use client';

import { useState } from 'react';

const reactions = [
  { type: 'like', label: 'Like', emoji: '👍', color: 'text-blue-600' },
  { type: 'love', label: 'Love', emoji: '❤️', color: 'text-red-500' },
  { type: 'care', label: 'Care', emoji: '🥰', color: 'text-yellow-500' },
  { type: 'haha', label: 'Haha', emoji: '😄', color: 'text-yellow-500' },
  { type: 'wow', label: 'Wow', emoji: '😲', color: 'text-yellow-500' },
  { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-yellow-500' },
  { type: 'angry', label: 'Angry', emoji: '😠', color: 'text-orange-500' },
];

interface ReactionPickerProps {
  onSelect: (reaction: string) => void;
}

export default function ReactionPicker({ onSelect }: ReactionPickerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-full shadow-lg border border-gray-300 px-3 py-2 flex items-center gap-2">
      {reactions.map((reaction, index) => (
        <button
          key={reaction.type}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onSelect(reaction.type)}
          className={`transform transition-all duration-200 hover:scale-125 ${
            hoveredIndex === index ? 'scale-110' : ''
          }`}
        >
          <div className="relative">
            <span className="text-2xl">{reaction.emoji}</span>
            {hoveredIndex === index && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {reaction.label}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}