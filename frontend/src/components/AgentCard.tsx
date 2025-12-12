import React from 'react';
import { useNavigate } from 'react-router-dom';

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