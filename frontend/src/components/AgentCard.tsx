import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';
import { Agent } from '../api/agents';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <Link
      to={`/chat/${agent.id}`}
      className="card hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {agent.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {agent.description}
          </p>
          
          {agent.tags && agent.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {agent.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
};