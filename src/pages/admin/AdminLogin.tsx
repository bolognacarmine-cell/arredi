import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Get API base URL - use relative paths in same-origin, absolute when VITE_API_BASE_URL is set
const getApiUrl = (path: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, '')}${path}`
  }
  return path // Use relative path for same-origin
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img
              src="/logo-farcom.png"
              alt="Farcom"
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <h1 className="font-display text-2xl font-light text-[#1A1A18] mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-[#4A4A46]">
            Accedi al pannello di amministrazione
          </p>
        </div>

        <div className="bg-white border border-[#DDD9D0] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1A18] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#DDD9D0] rounded focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
                placeholder="admin@farcom.local"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A1A18] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#DDD9D0] rounded focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B4332] text-white py-2.5 px-4 rounded hover:bg-[#143326] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#DDD9D0] text-center">
            <Link
              to="/"
              className="text-sm text-[#4A4A46] hover:text-[#1A1A18] transition-colors"
            >
              ← Torna al sito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
