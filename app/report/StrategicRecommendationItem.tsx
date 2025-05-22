import React from 'react';

interface StrategicRecommendation {
  id: string;
  action_title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  suggested_timeline: string;
  impact_statement: string;
  visual_icon_suggestion: string; // e.g., "timeline", "growth_chart", "user_group"
}

interface StrategicRecommendationItemProps {
  recommendation: StrategicRecommendation;
  index: number;
}

const priorityColors = {
  High: 'border-red-500 bg-red-50 text-red-700',
  Medium: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  Low: 'border-green-500 bg-green-50 text-green-700',
};

const categoryColors: { [key: string]: string } = {
  'Product Development': 'bg-sky-100 text-sky-700',
  'Market Expansion': 'bg-teal-100 text-teal-700',
  'Operational Efficiency': 'bg-indigo-100 text-indigo-700',
  'Brand Building': 'bg-rose-100 text-rose-700',
  'Customer Acquisition': 'bg-amber-100 text-amber-700',
  'Technology': 'bg-purple-100 text-purple-700',
  'Partnerships': 'bg-cyan-100 text-cyan-700',
  'Default': 'bg-gray-100 text-gray-700'
};

// A simple function to get a placeholder icon based on suggestion
// In a real app, you might use an icon library like Heroicons or FontAwesome
const getIconForSuggestion = (suggestion: string) => {
  // Basic Tailwind styled placeholders for now
  const baseStyle = "w-10 h-10 flex items-center justify-center rounded-lg text-white text-xl font-bold";
  switch (suggestion.toLowerCase()) {
    case 'timeline': return <div className={`${baseStyle} bg-blue-500`}>T</div>;
    case 'growth_chart': return <div className={`${baseStyle} bg-green-500`}>📈</div>;
    case 'user_group': return <div className={`${baseStyle} bg-purple-500`}>👥</div>;
    case 'gear': return <div className={`${baseStyle} bg-gray-500`}>⚙️</div>;
    case 'lightbulb': return <div className={`${baseStyle} bg-yellow-500`}>💡</div>;
    case 'rocket': return <div className={`${baseStyle} bg-red-500`}>🚀</div>;
    case 'map_pin': return <div className={`${baseStyle} bg-teal-500`}>📍</div>;
    default: return <div className={`${baseStyle} bg-slate-500`}>?</div>;
  }
};

const StrategicRecommendationItem: React.FC<StrategicRecommendationItemProps> = ({ recommendation, index }) => {
  const {
    action_title,
    description,
    category,
    priority,
    suggested_timeline,
    impact_statement,
    visual_icon_suggestion,
  } = recommendation;

  const prioColor = priorityColors[priority] || priorityColors.Medium;
  const catColor = categoryColors[category] || categoryColors.Default;

  return (
    <div className="flex items-start space-x-4 p-6 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200">
      <div className="flex-shrink-0 mt-1">
        {getIconForSuggestion(visual_icon_suggestion)}
      </div>
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
          <h4 className="text-lg font-semibold text-gray-800">{action_title}</h4>
          <div className="flex items-center mt-1 sm:mt-0 space-x-2">
            <span className={`px-3 py-0.5 text-xs font-semibold rounded-full ${catColor}`}>
              {category}
            </span>
            <span className={`px-3 py-0.5 text-xs font-semibold rounded-full ${prioColor} border`}>
              {priority} Priority
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs mt-3 pt-3 border-t border-gray-100">
          <div>
            <strong className="text-gray-500 block mb-0.5">Suggested Timeline:</strong>
            <span className="text-gray-700">{suggested_timeline}</span>
          </div>
          <div>
            <strong className="text-gray-500 block mb-0.5">Expected Impact:</strong>
            <span className="text-gray-700">{impact_statement}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicRecommendationItem; 