import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Shield, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/chat', { state: { initialMessage: searchQuery } });
    }
  };

  const examples = [
    {
      icon: Sparkles,
      title: 'Generative AI',
      description: 'What are some practical applications of generative AI in content creation?',
    },
    {
      icon: Shield,
      title: 'Ethical AI',
      description: 'Discuss the ethical considerations when developing AI systems',
    },
    {
      icon: TrendingUp,
      title: 'AI in Business',
      description: 'How can businesses leverage AI to improve customer service?',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <h1 className="text-5xl font-bold">
              HatchWorks<span className="text-primary-500">AI</span>
            </h1>
          </div>
          
          <h2 className="text-2xl text-gray-900 font-medium">
            How can we help with your AI initiatives?
          </h2>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask about AI opportunities..."
              className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </form>

        {/* Examples */}
        <div>
          <h3 className="text-center text-gray-600 font-medium mb-6">Examples</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example) => (
              <button
                key={example.title}
                onClick={() => {
                  setSearchQuery(example.description);
                  navigate('/chat', { state: { initialMessage: example.description } });
                }}
                className="card text-left hover:shadow-lg transition-all group"
              >
                <example.icon className="w-8 h-8 text-primary-500 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {example.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {example.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};