export default function imageLoader({ src, width, quality }) {
  // If it's already a full URL, return as is
  if (src.startsWith('http')) {
    return src;
  }
  
  // If it's a data URL, return as is
  if (src.startsWith('data:')) {
    return src;
  }
  
  // If it's an API route, return as is
  if (src.startsWith('/api/')) {
    return src;
  }
  
  // For uploads, try direct static serving
  if (src.startsWith('/uploads/')) {
    return src;
  }
  
  // If it's just a filename, construct the path
  if (!src.startsWith('/')) {
    return `/uploads/${src}`;
  }
  
  // Return the src as is for other cases
  return src;
}
