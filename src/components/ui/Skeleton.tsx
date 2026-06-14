import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  key?: React.Key;
}

/**
 * Komponen Skeleton Reusable
 * 
 * Digunakan untuk menampilkan placeholder berdenyut (pulse) saat data sedang dimuat
 * dari API atau LocalStorage untuk memberikan pengalaman transisi muat halaman yang modern.
 */
export default function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#E2E8F0] dark:bg-slate-800/70 ${className}`}
      {...props}
    />
  );
}
