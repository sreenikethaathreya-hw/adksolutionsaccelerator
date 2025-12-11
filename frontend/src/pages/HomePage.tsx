import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/chat', { state: { initialMessage: query } });
    }
  };

  const exampleQueries = [
    {
      title: 'Financial Analysis',
      query: 'Analyze Q4 financials for TechCorp with $5M revenue, $4M expenses',
    },
    {
      title: 'Market Research',
      query: 'What are the top trends in fintech for 2024?',
    },
    {
      title: 'KPI Development',
      query: 'Generate 5 KPIs for a SaaS company with 1000 customers',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img 
                src="/images/hatchworks-logo.png" 
                alt="HatchWorks AI" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              {/* Fallback */}
              <div className="hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  HatchWorks<span className="text-primary-500">AI</span>
                </span>
              </div>
            </div>

            {/* User Icon */}
            <a href="/settings" className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium hover:bg-gray-800 transition-colors">
              A
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Logo and Heading */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/images/hatchworks-logo.png" 
                alt="HatchWorks AI" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              {/* Fallback */}
              <div className="hidden flex items-center gap-3">
                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">H</span>
                </div>
                <h1 className="text-5xl font-bold text-gray-900">
                  HatchWorks<span className="text-primary-500">AI</span>
                </h1>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              How can we help with your AI initiatives?
            </h2>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-16">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about AI opportunities..."
                className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all shadow-sm"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Paperclip className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* Examples */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-6">Examples</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(example.query);
                    navigate('/chat', { state: { initialMessage: example.query } });
                  }}
                  className="p-6 bg-white border border-gray-200 rounded-xl text-left hover:border-primary-500 hover:shadow-md transition-all group"
                >
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {example.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {example.query}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};