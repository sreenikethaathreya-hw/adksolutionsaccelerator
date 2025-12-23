import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, LineChart, Target, Lightbulb, Shield, Zap } from 'lucide-react';
import { Header } from '../components/Header';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/chat', { state: { initialMessage: query } });
    }
  };

  const useCases = [
    {
      icon: <LineChart className="w-6 h-6 text-[#3aabba]" />,
      title: 'Financial Analysis',
      description: 'Analyze P&L statements, balance sheets, and cash flow with AI-powered insights',
      example: 'Analyze Q4 financials for TechCorp with $5M revenue',
      color: 'bg-blue-50',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#3aabba]" />,
      title: 'Market Research',
      description: 'Track industry trends, competitive landscape, and market opportunities',
      example: 'What are the top trends in fintech for 2024?',
      color: 'bg-green-50',
    },
    {
      icon: <Target className="w-6 h-6 text-[#3aabba]" />,
      title: 'KPI Development',
      description: 'Generate custom KPIs and performance indicators for your business',
      example: 'Generate 5 KPIs for a SaaS company with 1000 customers',
      color: 'bg-purple-50',
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-[#3aabba]" />,
      title: 'AI Opportunity Identification',
      description: 'Discover AI use cases and opportunities specific to your industry',
      example: 'Find AI opportunities for retail banking operations',
      color: 'bg-yellow-50',
    },
    {
      icon: <Shield className="w-6 h-6 text-[#3aabba]" />,
      title: 'Risk Assessment',
      description: 'Evaluate business risks and develop mitigation strategies',
      example: 'Assess risks for expanding into European markets',
      color: 'bg-red-50',
    },
    {
      icon: <Zap className="w-6 h-6 text-[#3aabba]" />,
      title: 'Process Automation',
      description: 'Identify processes that can be automated to improve efficiency',
      example: 'Which manual processes can we automate in finance?',
      color: 'bg-teal-50',
    },
  ];

  const quickExamples = [
    'Analyze customer churn patterns',
    'Compare our pricing to competitors',
    'Generate financial forecast for next quarter',
    'Identify cost reduction opportunities',
    'Evaluate market entry strategy',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <img 
              src="/images/hatchworks-logo.png" 
              alt="HatchWorks AI" 
              className="h-20 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            {/* Fallback */}
            <div className="hidden">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-[#3aabba] rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">H</span>
                </div>
                <h1 className="text-6xl font-bold text-gray-900">
                  HatchWorks<span className="text-[#3aabba]">AI</span>
                </h1>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-[#3aabba]">HatchWorks</span>AI
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Your AI-powered financial analysis platform
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about financial analysis, market trends, KPIs, or AI opportunities..."
                className="w-full pl-16 pr-6 py-5 text-lg text-gray-700 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#3aabba] focus:ring-4 focus:ring-[#3aabba]/20 transition-all shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[#3aabba] text-white rounded-xl hover:bg-[#215f67] transition-colors font-medium flex items-center gap-2"
              >
                Ask
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Examples */}
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-3">Try asking:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(example);
                    navigate('/chat', { state: { initialMessage: example } });
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#3aabba] hover:text-[#3aabba] transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            What can HatchWorks AI help you with?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            From financial analysis to AI opportunity identification, our platform provides 
            intelligent insights to drive your business forward.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#3aabba] transition-all cursor-pointer group"
                onClick={() => {
                  setQuery(useCase.example);
                  navigate('/chat', { state: { initialMessage: useCase.example } });
                }}
              >
                <div className={`w-14 h-14 ${useCase.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {useCase.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#3aabba] transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {useCase.description}
                </p>
                <div className="flex items-center text-[#3aabba] text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Try example</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#3aabba] to-[#215f67] rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Explore our AI agents or dive right into a conversation to discover 
            how we can help transform your business.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="px-8 py-4 bg-white text-[#3aabba] rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Chat
            </button>
            <button
              onClick={() => navigate('/catalog')}
              className="px-8 py-4 bg-[#215f67] text-white rounded-xl font-semibold hover:bg-[#2D2D2D] transition-colors border-2 border-white/20"
            >
              Browse Agents
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};