import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { AgentCard, Agent } from '../components/AgentCard';
import { getAgents } from '../api/agents';

export const AgentCatalogPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // All available tags
  const allTags = [
    'finance',
    'analysis',
    'market',
    'research',
    'kpi',
    'metrics',
    'ai',
    'automation',
    'trends',
    'opportunities',
  ];

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
      // Use fallback agents if API fails
      setAgents(getFallbackAgents());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAgents = (): Agent[] => {
    return [
      {
        id: 'financial_agent',
        name: 'Financial Analysis Agent',
        description: 'Analyze P&L statements, balance sheets, and cash flow. Calculate financial ratios and provide actionable insights on profitability, liquidity, and solvency.',
        tags: ['finance', 'analysis', 'p&l', 'ratios', 'cash flow'],
        color: 'blue',
      },
      {
        id: 'market_agent',
        name: 'Market Research Agent',
        description: 'Research market trends, competitive landscape, and industry insights. Track emerging opportunities and monitor competitor activities across your target markets.',
        tags: ['market', 'research', 'trends', 'competitors', 'analysis'],
        color: 'green',
      },
      {
        id: 'kpi_agent',
        name: 'KPI Development Agent',
        description: 'Generate custom leading and lagging indicators tailored to your business. Create measurable KPIs that align with your strategic objectives and drive performance.',
        tags: ['kpi', 'metrics', 'performance', 'indicators', 'goals'],
        color: 'purple',
      },
      {
        id: 'ai_opportunity_agent',
        name: 'AI Opportunity Finder',
        description: 'Identify automation opportunities and AI implementation areas using the AI Opportunity Finder framework. Discover where AI can drive efficiency and innovation in your operations.',
        tags: ['ai', 'automation', 'opportunities', 'innovation', 'efficiency'],
        color: 'orange',
      },
    ];
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredAgents = agents.filter((agent) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => agent.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Catalog</h1>
              <p className="text-gray-600">
                Choose an AI agent to help with your task
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents by name or capability..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
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
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tags */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by category:</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {loading ? (
              'Loading agents...'
            ) : (
              <>
                Showing {filteredAgents.length} of {agents.length} agent
                {agents.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {/* Agents Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="w-14 h-14 bg-gray-200 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded mb-1 w-full" />
                <div className="h-4 bg-gray-200 rounded mb-4 w-5/6" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
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
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};