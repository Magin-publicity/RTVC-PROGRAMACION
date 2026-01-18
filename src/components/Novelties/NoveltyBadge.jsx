// src/components/Novelties/NoveltyBadge.jsx
import React from 'react';
import { getNoveltyIcon, getNoveltyColor, getNoveltyBgColor, getNoveltyName } from '../../data/novelties';

export const NoveltyBadge = ({ type, size = 'md' }) => {
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium ${sizes[size]}`}
      style={{
        backgroundColor: getNoveltyBgColor(type),
        color: getNoveltyColor(type)
      }}
    >
      <span>{getNoveltyIcon(type)}</span>
      <span>{getNoveltyName(type)}</span>
    </span>
  );
};