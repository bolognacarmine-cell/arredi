/**
 * Navigation utilities for handling parent path navigation
 */

/**
 * Returns the parent path of a given path.
 * For example:
 * - "/settori/bar" → "/settori"
 * - "/blog/slug" → "/blog"
 * - "/admin/progetti/123" → "/admin/progetti"
 * - "/" → "/"
 * - "/progetti" → "/"
 *
 * @param currentPath - The current path
 * @returns The parent path
 */
export const getParentPath = (currentPath: string): string => {
  const segments = currentPath.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  return '/' + segments.slice(0, -1).join('/');
};

/**
 * Returns the parent path with a fallback if the parent is root.
 * Useful when you want to navigate to a specific page instead of home
 * when at the root level.
 *
 * @param currentPath - The current path
 * @param fallback - The fallback path (default: "/")
 * @returns The parent path or fallback
 */
export const getParentPathWithFallback = (currentPath: string, fallback: string = '/'): string => {
  const parent = getParentPath(currentPath);
  return parent === '/' ? fallback : parent;
};
