// Su Render il backend non è disponibile, disabilitiamo le chiamate API
// In development, fallback to localhost:3002 if not configured
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002"
const isApiAvailable = !!API_BASE_URL

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

export async function getPosts(params?: {
  sectorSlug?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedPostsResponse> {
  if (!isApiAvailable) {
    return {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }

  try {
    const queryParams = new URLSearchParams();
    if (params?.sectorSlug) queryParams.append('sectorSlug', params.sectorSlug);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/blog/posts?${queryParams.toString()}`);
    const result = await response.json();

    if (result.success) {
      return result;
    }

    throw new Error(result.error || 'Failed to fetch posts');
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isApiAvailable) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${slug}`);
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function getSectors(): Promise<BlogSector[]> {
  if (!isApiAvailable) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/sectors`);
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return [];
  }
}

export async function createPost(data: Omit<Post, '_id' | 'publishedAt' | 'updatedAt'>): Promise<Post> {
  if (!isApiAvailable) {
    throw new Error('API not available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    throw new Error(result.error || 'Failed to create post');
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  if (!isApiAvailable) {
    throw new Error('API not available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    throw new Error(result.error || 'Failed to update post');
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deletePost(id: string): Promise<void> {
  if (!isApiAvailable) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!result.success) {
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
