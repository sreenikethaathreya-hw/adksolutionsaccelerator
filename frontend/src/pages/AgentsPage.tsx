import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Bot, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  color: string;
  icon: any;
}

export const AgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allTags = [
    'finance',
    'analysis',
    'market',
    'research',
    'kpi',
    'metrics',
    'ai',
    'automation',
  ];

  const agents: Agent[] = [
    {
      id: 'financial_agent',
      name: 'Financial Analysis Agent',
      description: 'Analyze P&L statements, balance sheets, and cash flow. Calculate financial ratios and provide actionable insights on profitability, liquidity, and solvency.',
      tags: ['finance', 'analysis'],
      color: 'blue',
      icon: BarChart3,
    },
    {
      id: 'market_agent',
      name: 'Market Research Agent',
      description: 'Research market trends, competitive landscape, and industry insights. Track emerging opportunities and monitor competitor activities across your target markets.',
      tags: ['market', 'research', 'analysis'],
      color: 'green',
      icon: TrendingUp,
    },
    {
      id: 'kpi_agent',
      name: 'KPI Development Agent',
      description: 'Generate custom leading and lagging indicators tailored to your business. Create measurable KPIs that align with your strategic objectives and drive performance.',
      tags: ['kpi', 'metrics'],
      color: 'purple',
      icon: Bot,
    },
    {
      id: 'ai_opportunity_agent',
      name: 'AI Opportunity Finder',
      description: 'Identify automation opportunities and AI implementation areas. Discover where AI can drive efficiency and innovation in your operations.',
      tags: ['ai', 'automation'],
      color: 'orange',
      icon: Lightbulb,
    },
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => agent.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colors[color] || 'bg-primary-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Agent Catalog</h1>
          <p className="text-lg text-gray-600">
            Powerful AI agents designed to support financial analysis, market research, and KPI development.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents by name, description, or tag..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTags([])}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTags.length === 0
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAgents.length} of {agents.length} agent
            {agents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Agents Grid/List */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No agents found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTags([]);
              }}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => navigate('/chat')}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className={`${getColorClasses(agent.color)} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <agent.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {agent.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
