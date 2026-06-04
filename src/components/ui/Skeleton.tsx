import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Komponen Skeleton Reusable
 * 
 * Digunakan untuk menampilkan placeholder berdenyut (pulse) saat data sedang dimuat
 * dari API atau LocalStorage untuk memberikan pengalaman transisi muat halaman yang modern.
 */
export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#E2E8F0] ${className}`}
    />
  );
}
