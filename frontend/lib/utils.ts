import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize image URL to ensure it points to the correct backend
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.svg'
  
  // If already a full URL (http/https or external CDN), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If it's a relative uploads path, prepend the backend URL
  if (url.startsWith('/uploads/')) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    return `${API_BASE}${url}`
  }
  
  // Otherwise return as-is
  return url
}
