/**
 * BLOG API LOGIC - Fallback Strategy
 *
 * This file implements a robust fallback strategy for blog data:
 *
 * 1. If VITE_API_BASE_URL is set:
 *    - Try to fetch from the API first
 *    - If API fails (network error, 5xx, timeout), fallback to static data
 *    - This ensures the blog always works even if the API is down
 *
 * 2. If VITE_API_BASE_URL is NOT set:
 *    - Use static data directly (GitHub Pages case)
 *    - No API calls are attempted
 *
 * 3. Development environment:
 *    - Set VITE_API_BASE_URL to use local API (e.g., http://localhost:3002)
 *    - If not set, defaults to localhost:3002 with fallback to static data
 *
 * STATIC DATA SOURCE: src/data/blogPosts.json
 *
 * To configure API URL in production:
 * - Set VITE_API_BASE_URL in GitHub Actions secrets or deployment config
 * - Example: VITE_API_BASE_URL=https://your-api.onrender.com
 */

// Get API base URL - use relative paths in same-origin, absolute when VITE_API_BASE_URL is set
const getApiUrl = (path: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002"
const hasApiConfigured = !!import.meta.env.VITE_API_BASE_URL

// Static data for fallback (GitHub Pages and API failures)
import staticBlogPosts from '../data/blogPosts.json'

export interface Author {
  name: string;
  role: string;
  avatar?: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  sectorSlug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  author: Author;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  relatedProductSlugs?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
}

export interface BlogSector {
  slug: string;
  title: string;
  count: number;
  coverImage?: string;
}

export interface PaginatedPostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper function to get posts from static data
function getPostsFromStatic(params?: {
  sectorSlug?: string;
  page?: number;
  limit?: number;
}): PaginatedPostsResponse {
  let filteredPosts = staticBlogPosts.filter((p: Post) => p.isPublished);

  if (params?.sectorSlug) {
    filteredPosts = filteredPosts.filter((p: Post) => p.sectorSlug === params.sectorSlug);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  const paginatedPosts = filteredPosts
    .sort((a: Post, b: Post) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(skip, skip + limit);

  return {
    success: true,
    data: paginatedPosts,
    pagination: {
      page,
      limit,
      total: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / limit),
    },
  };
}

export async function getPosts(params?: {
  sectorSlug?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedPostsResponse> {
  // If no API configured, use static data directly
  if (!hasApiConfigured) {
    console.log('[Blog API] No API configured, using static data');
    return getPostsFromStatic(params);
  }

  // Try API first, fallback to static on error
  try {
    const queryParams = new URLSearchParams();
    if (params?.sectorSlug) queryParams.append('sectorSlug', params.sectorSlug);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = getApiUrl('/api/blog/posts')
    console.log(`[Blog API] Fetching from ${url}`);
    const response = await fetch(`${url}?${queryParams.toString()}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const result = await response.json();

    if (result.success) {
      console.log('[Blog API] Successfully fetched from API');
      return result;
    }

    throw new Error(result.error || 'Failed to fetch posts');
  } catch (error) {
    console.warn('[Blog API] API call failed, falling back to static data:', error);
    return getPostsFromStatic(params);
  }
}

// Helper function to get post from static data
function getPostFromStatic(slug: string): Post | null {
  return staticBlogPosts.find((p: Post) => p.slug === slug && p.isPublished) || null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // If no API configured, use static data directly
  if (!hasApiConfigured) {
    console.log('[Blog API] No API configured, using static data for post');
    return getPostFromStatic(slug);
  }

  // Try API first, fallback to static on error
  try {
    const url = getApiUrl(`/api/blog/posts/${slug}`)
    console.log(`[Blog API] Fetching post ${slug} from ${url}`);
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const result = await response.json();

    if (result.success) {
      console.log('[Blog API] Successfully fetched post from API');
      return result.data;
    }

    return null;
  } catch (error) {
    console.warn('[Blog API] API call failed for post, falling back to static data:', error);
    return getPostFromStatic(slug);
  }
}

// Helper function to get sectors from static data
function getSectorsFromStatic(): BlogSector[] {
  const sectorMap = new Map<string, { count: number; latestPost: Post }>();

  staticBlogPosts.forEach((post: Post) => {
    if (post.isPublished) {
      const existing = sectorMap.get(post.sectorSlug);
      if (!existing || new Date(post.publishedAt) > new Date(existing.latestPost.publishedAt)) {
        sectorMap.set(post.sectorSlug, {
          count: (existing?.count || 0) + 1,
          latestPost: post,
        });
      } else {
        sectorMap.set(post.sectorSlug, {
          count: existing.count + 1,
          latestPost: existing.latestPost,
        });
      }
    }
  });

  const sectorTitles: Record<string, string> = {
    'barbieri': 'Barbieri',
    'negozi': 'Negozi',
    'scuole': 'Scuole',
    'bar': 'Bar',
    'centri-estetici': 'Centri Estetici',
    'uffici': 'Uffici',
  };

  return Array.from(sectorMap.entries()).map(([slug, data]) => ({
    slug,
    title: sectorTitles[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
    count: data.count,
    coverImage: data.latestPost.coverImage,
  }));
}

export async function getSectors(): Promise<BlogSector[]> {
  // If no API configured, use static data directly
  if (!hasApiConfigured) {
    console.log('[Blog API] No API configured, using static data for sectors');
    return getSectorsFromStatic();
  }

  // Try API first, fallback to static on error
  try {
    const url = getApiUrl('/api/blog/sectors')
    console.log(`[Blog API] Fetching sectors from ${url}`);
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const result = await response.json();

    if (result.success) {
      console.log('[Blog API] Successfully fetched sectors from API');
      return result.data;
    }

    return [];
  } catch (error) {
    console.warn('[Blog API] API call failed for sectors, falling back to static data:', error);
    return getSectorsFromStatic();
  }
}

export async function createPost(data: Omit<Post, '_id' | 'publishedAt' | 'updatedAt'>): Promise<Post> {
  if (!hasApiConfigured) {
    throw new Error('Cannot create post: API not configured. Set VITE_API_BASE_URL to enable post creation.');
  }

  try {
    const response = await fetch(getApiUrl('/api/blog/posts'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result?.error?.message || result?.message || result.error || 'Failed to create post');

    if (result.success) {
      return result.data;
    }

    if (result._id || result.id) return result as Post;

    throw new Error(result.error || 'Failed to create post');
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  if (!hasApiConfigured) {
    throw new Error('Cannot update post: API not configured. Set VITE_API_BASE_URL to enable post updates.');
  }

  try {
    const response = await fetch(getApiUrl(`/api/blog/posts/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result?.error?.message || result?.message || result.error || 'Failed to update post');

    if (result.success) {
      return result.data;
    }

    if (result._id || result.id) return result as Post;

    throw new Error(result.error || 'Failed to update post');
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deletePost(id: string): Promise<void> {
  if (!hasApiConfigured) {
    throw new Error('Cannot delete post: API not configured. Set VITE_API_BASE_URL to enable post deletion.');
  }

  try {
    const response = await fetch(getApiUrl(`/api/blog/posts/${id}`), {
      method: 'DELETE',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok && result?.error) {
      throw new Error(result.error.message || result.error || 'Failed to delete post');
    }

    if (!result.success && !(result.message || response.ok)) {
      throw new Error(result.error || 'Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// Helper function to generate SEO-friendly slug from title
export function generateSlug(title: string): string {
  const stopWords = ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'in', 'con', 'per', 'da', 'a', 'su', 'di', 'del', 'dello', 'della', 'dei', 'degli', 'delle', 'e', 'o', 'ma', 'perché', 'come', 'che', 'non'];
  
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .split(' ')
    .filter(word => word && !stopWords.includes(word))
    .join('-')
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
}
