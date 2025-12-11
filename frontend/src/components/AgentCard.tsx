import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  icon?: string;
  color?: string;
}

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat', { 
      state: { 
        agentId: agent.id,
        agentName: agent.name 
      } 
    });
  };

  // Agent-specific colors
  const getColorClasses = () => {
    switch (agent.id) {
      case 'financial_agent':
        return {
          bg: 'bg-blue-50',
          icon: 'bg-blue-500',
          iconHover: 'group-hover:bg-blue-600',
          text: 'text-blue-600',
        };
      case 'market_agent':
        return {
          bg: 'bg-green-50',
          icon: 'bg-green-500',
          iconHover: 'group-hover:bg-green-600',
          text: 'text-green-600',
        };
      case 'kpi_agent':
        return {
          bg: 'bg-purple-50',
          icon: 'bg-purple-500',
          iconHover: 'group-hover:bg-purple-600',
          text: 'text-purple-600',
        };
      case 'ai_opportunity_agent':
        return {
          bg: 'bg-orange-50',
          icon: 'bg-orange-500',
          iconHover: 'group-hover:bg-orange-600',
          text: 'text-orange-600',
        };
      default:
        return {
          bg: 'bg-primary-50',
          icon: 'bg-primary-500',
          iconHover: 'group-hover:bg-primary-600',
          text: 'text-primary-600',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-500 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Name - prominently displayed in teal */}
      <h3 className="text-xl font-semibold text-primary-500 mb-3 group-hover:text-primary-600 transition-colors">
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
  );
};