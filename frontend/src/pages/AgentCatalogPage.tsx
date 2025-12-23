import React, { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { Agent } from '../components/AgentCard';
import { getAgents } from '../api/agents';
import { useNavigate } from 'react-router-dom';

export const AgentCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // All available tags
  const allTags = [
    'All',
    'AI',
    'Analytics',
    'Automation',
    'Compliance',
    'Engineering',
    'Finance',
    'Forecasting',
    'Market Analysis',
    'Operations',
    'Risk Management'
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
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (tag === 'All') {
      setSelectedTags([]);
    } else {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#3aabba] mb-3">Agent Catalog</h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Powerful AI agents designed to support you with financial analysis, market research, 
            AI opportunity identification, and KPI development for your clients.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents by name, description, or tag..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3aabba] focus:border-transparent bg-white"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tag === 'All' && selectedTags.length === 0
                    ? 'bg-[#3aabba] text-white'
                    : selectedTags.includes(tag)
                    ? 'bg-[#3aabba] text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Agents Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
                <div className="h-4 bg-gray-200 rounded mb-4 w-5/6" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-20" />
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
              className="bg-[#3aabba] text-white px-6 py-2 rounded-lg hover:bg-[#215f67] transition-colors"
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
                onClick={() =>
                  navigate('/chat', {
                    state: {
                      agentId: agent.id,
                      agentName: agent.name,
                    },
                  })
                }
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-[#3aabba] hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Agent Name */}
                <h3 className="text-xl font-semibold text-[#3aabba] mb-3 group-hover:text-[#215f67] transition-colors">
                  {agent.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                  {agent.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {agent.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      +{agent.tags.length - 4}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};